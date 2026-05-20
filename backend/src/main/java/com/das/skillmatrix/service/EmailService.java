package com.das.skillmatrix.service;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.das.skillmatrix.entity.EmailTemplate;
import com.das.skillmatrix.entity.SmtpConfig;
import com.das.skillmatrix.entity.TriggerEvent;
import com.das.skillmatrix.repository.SmtpConfigRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final SmtpConfigRepository smtpConfigRepository;

    private final MailSenderFactory mailSenderFactory;

    private final EmailTemplateService emailTemplateService;

    private final NotificationRuleService notificationRuleService;

    @Async
    public void send(TriggerEvent triggerEvent, String recipient, Map<String, String> variables) {
        if (!this.notificationRuleService.isEnabled(triggerEvent)) {
            log.debug("Email trigger {} is disabled — skipping", triggerEvent);
            return;
        }
        Optional<EmailTemplate> template = this.emailTemplateService.findActiveByTrigger(triggerEvent);
        if (template.isEmpty()) {
            log.warn("No active template for trigger {} — skipping", triggerEvent);
            return;
        }
        Map<String, String> safeVars = variables == null ? Collections.emptyMap() : variables;
        String subject = this.substitute(template.get().getSubject(), safeVars);
        String body = this.substitute(template.get().getBodyHtml(), safeVars);
        this.dispatch(recipient, subject, body);
    }

    public void send(String recipient, String subject, String body) {
        this.dispatch(recipient, subject, body);
    }

    public String substitute(String template, Map<String, String> variables) {
        if (template == null) {
            return null;
        }
        String result = template;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            String value = entry.getValue() == null ? "" : entry.getValue();
            result = result.replace("{{" + entry.getKey() + "}}", value);
        }
        return result;
    }

    private void dispatch(String recipient, String subject, String body) {
        Optional<SmtpConfig> config = this.smtpConfigRepository.findById(SmtpConfig.SINGLETON_ID);
        if (config.isEmpty()) {
            log.warn("SMTP not configured — logging email instead. to={} subject={}", recipient, subject);
            return;
        }
        JavaMailSender sender = this.mailSenderFactory.build(config.get());
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(this.buildFromAddress(config.get()));
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(body);
        try {
            sender.send(message);
        } catch (MailException ex) {
            log.warn("Failed to send email to {}: {}", recipient, ex.getMessage());
        }
    }

    private String buildFromAddress(SmtpConfig config) {
        if (StringUtils.hasText(config.getFromName())) {
            return config.getFromName() + " <" + config.getFromEmail() + ">";
        }
        return config.getFromEmail();
    }
}
