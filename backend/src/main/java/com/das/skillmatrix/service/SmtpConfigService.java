package com.das.skillmatrix.service;

import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.das.skillmatrix.constants.ConfigConstants;
import com.das.skillmatrix.dto.request.SmtpConfigRequest;
import com.das.skillmatrix.dto.response.SmtpConfigResponse;
import com.das.skillmatrix.entity.SmtpConfig;
import com.das.skillmatrix.exception.ResourceNotFoundException;
import com.das.skillmatrix.repository.SmtpConfigRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class SmtpConfigService {

    private final SmtpConfigRepository smtpConfigRepository;

    private final MailSenderFactory mailSenderFactory;

    @Transactional(readOnly = true)
    public SmtpConfigResponse getConfig() {
        SmtpConfig config = this.findConfigOrThrow();
        return this.toResponse(config);
    }

    public SmtpConfigResponse updateConfig(SmtpConfigRequest request) {
        SmtpConfig config = this.smtpConfigRepository.findById(SmtpConfig.SINGLETON_ID)
                .orElseGet(this::createSingleton);
        config.setHost(request.getHost().trim());
        config.setPort(request.getPort());
        config.setUsername(request.getUsername());
        if (StringUtils.hasText(request.getPassword())) {
            config.setPasswordEncrypted(request.getPassword());
        }
        config.setFromEmail(request.getFromEmail().trim());
        config.setFromName(request.getFromName());
        config.setUseTls(Boolean.TRUE.equals(request.getUseTls()));
        SmtpConfig saved = this.smtpConfigRepository.save(config);
        return this.toResponse(saved);
    }

    public void sendTestEmail(String adminEmail) {
        SmtpConfig config = this.findConfigOrThrow();
        JavaMailSender sender = this.mailSenderFactory.build(config);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(this.buildFromAddress(config));
        message.setTo(adminEmail);
        message.setSubject("Skill Matrix — SMTP test");
        message.setText("This is a test email from the Skill Matrix admin SMTP configuration.");
        try {
            sender.send(message);
        } catch (MailException ex) {
            log.warn("SMTP test send failed: {}", ex.getMessage());
            throw new IllegalArgumentException(ConfigConstants.MSG_SMTP_TEST_FAILED);
        }
    }

    private SmtpConfig findConfigOrThrow() {
        return this.smtpConfigRepository.findById(SmtpConfig.SINGLETON_ID)
                .orElseThrow(() -> new ResourceNotFoundException(ConfigConstants.MSG_SMTP_NOT_CONFIGURED));
    }

    private SmtpConfig createSingleton() {
        SmtpConfig config = new SmtpConfig();
        config.setId(SmtpConfig.SINGLETON_ID);
        return config;
    }

    private String buildFromAddress(SmtpConfig config) {
        if (StringUtils.hasText(config.getFromName())) {
            return config.getFromName() + " <" + config.getFromEmail() + ">";
        }
        return config.getFromEmail();
    }

    private SmtpConfigResponse toResponse(SmtpConfig config) {
        return SmtpConfigResponse.builder()
                .host(config.getHost())
                .port(config.getPort())
                .username(config.getUsername())
                .passwordSet(StringUtils.hasText(config.getPasswordEncrypted()))
                .fromEmail(config.getFromEmail())
                .fromName(config.getFromName())
                .useTls(config.isUseTls())
                .build();
    }
}
