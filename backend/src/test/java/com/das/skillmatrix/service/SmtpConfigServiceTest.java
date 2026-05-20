package com.das.skillmatrix.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import com.das.skillmatrix.constants.ConfigConstants;
import com.das.skillmatrix.dto.request.SmtpConfigRequest;
import com.das.skillmatrix.dto.response.SmtpConfigResponse;
import com.das.skillmatrix.entity.SmtpConfig;
import com.das.skillmatrix.exception.ResourceNotFoundException;
import com.das.skillmatrix.repository.SmtpConfigRepository;

@ExtendWith(MockitoExtension.class)
class SmtpConfigServiceTest {

    @Mock
    private SmtpConfigRepository smtpConfigRepository;

    @Mock
    private MailSenderFactory mailSenderFactory;

    @Mock
    private JavaMailSender javaMailSender;

    @InjectMocks
    private SmtpConfigService smtpConfigService;

    private SmtpConfig existingConfig;

    @BeforeEach
    void setUp() {
        existingConfig = new SmtpConfig();
        existingConfig.setId(SmtpConfig.SINGLETON_ID);
        existingConfig.setHost("smtp.example.com");
        existingConfig.setPort(587);
        existingConfig.setUsername("user");
        existingConfig.setPasswordEncrypted("secret");
        existingConfig.setFromEmail("noreply@example.com");
        existingConfig.setFromName("Skill Matrix");
        existingConfig.setUseTls(true);
    }

    @Test
    @DisplayName("getConfig() throws when not configured")
    void getConfig_throwsWhenMissing() {
        when(smtpConfigRepository.findById(SmtpConfig.SINGLETON_ID)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> smtpConfigService.getConfig());
        assertEquals(ConfigConstants.MSG_SMTP_NOT_CONFIGURED, ex.getMessage());
    }

    @Test
    @DisplayName("getConfig() masks password by exposing only passwordSet flag")
    void getConfig_masksPassword() {
        when(smtpConfigRepository.findById(SmtpConfig.SINGLETON_ID)).thenReturn(Optional.of(existingConfig));

        SmtpConfigResponse response = smtpConfigService.getConfig();

        assertTrue(response.isPasswordSet());
        assertEquals("smtp.example.com", response.getHost());
    }

    @Test
    @DisplayName("updateConfig() keeps existing password when request password blank")
    void updateConfig_keepsExistingPassword() {
        when(smtpConfigRepository.findById(SmtpConfig.SINGLETON_ID)).thenReturn(Optional.of(existingConfig));
        when(smtpConfigRepository.save(any(SmtpConfig.class))).thenAnswer(inv -> inv.getArgument(0));

        SmtpConfigRequest request = new SmtpConfigRequest(
                "smtp.new.com", 25, "newuser", "", "from@new.com", "From Name", true);

        SmtpConfigResponse response = smtpConfigService.updateConfig(request);

        assertEquals("smtp.new.com", response.getHost());
        assertEquals("secret", existingConfig.getPasswordEncrypted());
        assertTrue(response.isPasswordSet());
    }

    @Test
    @DisplayName("updateConfig() creates singleton when not present")
    void updateConfig_createsSingleton() {
        when(smtpConfigRepository.findById(SmtpConfig.SINGLETON_ID)).thenReturn(Optional.empty());
        when(smtpConfigRepository.save(any(SmtpConfig.class))).thenAnswer(inv -> inv.getArgument(0));

        SmtpConfigRequest request = new SmtpConfigRequest(
                "smtp.x.com", 25, "u", "p", "from@x.com", null, false);

        SmtpConfigResponse response = smtpConfigService.updateConfig(request);

        assertEquals("smtp.x.com", response.getHost());
        assertFalse(response.isUseTls());
    }

    @Test
    @DisplayName("sendTestEmail() dispatches via factory-built sender")
    void sendTestEmail_dispatches() {
        when(smtpConfigRepository.findById(SmtpConfig.SINGLETON_ID)).thenReturn(Optional.of(existingConfig));
        when(mailSenderFactory.build(existingConfig)).thenReturn(javaMailSender);

        smtpConfigService.sendTestEmail("admin@x.com");

        verify(javaMailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    @DisplayName("sendTestEmail() wraps MailException as IllegalArgumentException")
    void sendTestEmail_wrapsMailException() {
        when(smtpConfigRepository.findById(SmtpConfig.SINGLETON_ID)).thenReturn(Optional.of(existingConfig));
        when(mailSenderFactory.build(existingConfig)).thenReturn(javaMailSender);
        doThrow(new MailSendException("oops")).when(javaMailSender).send(any(SimpleMailMessage.class));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> smtpConfigService.sendTestEmail("admin@x.com"));
        assertEquals(ConfigConstants.MSG_SMTP_TEST_FAILED, ex.getMessage());
    }
}
