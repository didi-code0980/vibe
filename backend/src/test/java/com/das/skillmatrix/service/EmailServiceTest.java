package com.das.skillmatrix.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import com.das.skillmatrix.entity.EmailTemplate;
import com.das.skillmatrix.entity.SmtpConfig;
import com.das.skillmatrix.entity.TriggerEvent;
import com.das.skillmatrix.repository.SmtpConfigRepository;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private SmtpConfigRepository smtpConfigRepository;

    @Mock
    private MailSenderFactory mailSenderFactory;

    @Mock
    private EmailTemplateService emailTemplateService;

    @Mock
    private NotificationRuleService notificationRuleService;

    @Mock
    private JavaMailSender javaMailSender;

    @InjectMocks
    private EmailService emailService;

    private SmtpConfig smtpConfig;

    private EmailTemplate template;

    @BeforeEach
    void setUp() {
        smtpConfig = new SmtpConfig();
        smtpConfig.setId(SmtpConfig.SINGLETON_ID);
        smtpConfig.setHost("smtp.example.com");
        smtpConfig.setPort(587);
        smtpConfig.setFromEmail("noreply@example.com");
        smtpConfig.setFromName("SM");
        smtpConfig.setUseTls(true);

        template = new EmailTemplate();
        template.setSubject("Hello {{name}}");
        template.setBodyHtml("<p>Welcome {{name}}, your code is {{code}}</p>");
        template.setTriggerEvent(TriggerEvent.ACCOUNT_CREATED);
        template.setActive(true);
    }

    @Test
    @DisplayName("substitute() replaces all variables")
    void substitute_replacesVariables() {
        String result = emailService.substitute(
                "Hi {{name}}, your role is {{role}}",
                Map.of("name", "Alice", "role", "ADMIN"));

        assertEquals("Hi Alice, your role is ADMIN", result);
    }

    @Test
    @DisplayName("substitute() treats null values as empty")
    void substitute_handlesNull() {
        java.util.HashMap<String, String> vars = new java.util.HashMap<>();
        vars.put("name", null);

        String result = emailService.substitute("Hello {{name}}", vars);

        assertEquals("Hello ", result);
    }

    @Test
    @DisplayName("send(trigger) skips when rule is disabled")
    void send_skipsWhenRuleDisabled() {
        when(notificationRuleService.isEnabled(TriggerEvent.GOAL_SUGGESTED)).thenReturn(false);

        emailService.send(TriggerEvent.GOAL_SUGGESTED, "a@b.com", Map.of("name", "Alice"));

        verify(emailTemplateService, never()).findActiveByTrigger(any());
    }

    @Test
    @DisplayName("send(trigger) skips when no active template")
    void send_skipsWhenNoTemplate() {
        when(notificationRuleService.isEnabled(TriggerEvent.GOAL_SUGGESTED)).thenReturn(true);
        when(emailTemplateService.findActiveByTrigger(TriggerEvent.GOAL_SUGGESTED))
                .thenReturn(Optional.empty());

        emailService.send(TriggerEvent.GOAL_SUGGESTED, "a@b.com", Map.of());

        verify(smtpConfigRepository, never()).findById(any());
    }

    @Test
    @DisplayName("send(trigger) sends substituted email when configured")
    void send_dispatchesViaSender() {
        when(notificationRuleService.isEnabled(TriggerEvent.ACCOUNT_CREATED)).thenReturn(true);
        when(emailTemplateService.findActiveByTrigger(TriggerEvent.ACCOUNT_CREATED))
                .thenReturn(Optional.of(template));
        when(smtpConfigRepository.findById(SmtpConfig.SINGLETON_ID)).thenReturn(Optional.of(smtpConfig));
        when(mailSenderFactory.build(smtpConfig)).thenReturn(javaMailSender);

        emailService.send(TriggerEvent.ACCOUNT_CREATED, "alice@example.com",
                Map.of("name", "Alice", "code", "ABC123"));

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(javaMailSender, times(1)).send(captor.capture());
        SimpleMailMessage sent = captor.getValue();
        assertEquals("Hello Alice", sent.getSubject());
        assertEquals("<p>Welcome Alice, your code is ABC123</p>", sent.getText());
    }

    @Test
    @DisplayName("send(trigger) skips dispatch when SMTP not configured")
    void send_skipsWhenSmtpMissing() {
        when(notificationRuleService.isEnabled(TriggerEvent.ACCOUNT_CREATED)).thenReturn(true);
        when(emailTemplateService.findActiveByTrigger(TriggerEvent.ACCOUNT_CREATED))
                .thenReturn(Optional.of(template));
        when(smtpConfigRepository.findById(SmtpConfig.SINGLETON_ID)).thenReturn(Optional.empty());

        emailService.send(TriggerEvent.ACCOUNT_CREATED, "alice@example.com", Map.of("name", "Alice"));

        verify(mailSenderFactory, never()).build(any());
    }
}
