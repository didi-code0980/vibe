package com.das.skillmatrix.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.das.skillmatrix.constants.ConfigConstants;
import com.das.skillmatrix.dto.request.EmailTemplateRequest;
import com.das.skillmatrix.dto.response.EmailTemplateResponse;
import com.das.skillmatrix.entity.EmailTemplate;
import com.das.skillmatrix.entity.TriggerEvent;
import com.das.skillmatrix.exception.ResourceNotFoundException;
import com.das.skillmatrix.repository.EmailTemplateRepository;

@ExtendWith(MockitoExtension.class)
class EmailTemplateServiceTest {

    @Mock
    private EmailTemplateRepository emailTemplateRepository;

    @InjectMocks
    private EmailTemplateService emailTemplateService;

    @Test
    @DisplayName("create() persists new template")
    void create_persistsTemplate() {
        EmailTemplateRequest request = new EmailTemplateRequest(
                "Welcome", "Welcome {{name}}", "<p>Hi {{name}}</p>",
                TriggerEvent.ACCOUNT_CREATED, "[\"name\"]", true);

        when(emailTemplateRepository.existsByNameIgnoreCase("Welcome")).thenReturn(false);
        when(emailTemplateRepository.save(any(EmailTemplate.class))).thenAnswer(inv -> {
            EmailTemplate t = inv.getArgument(0);
            t.setId(1L);
            return t;
        });

        EmailTemplateResponse response = emailTemplateService.create(request);

        assertNotNull(response.getId());
        assertEquals("Welcome", response.getName());
        assertEquals(TriggerEvent.ACCOUNT_CREATED, response.getTriggerEvent());
    }

    @Test
    @DisplayName("create() rejects duplicate name")
    void create_rejectsDuplicateName() {
        EmailTemplateRequest request = new EmailTemplateRequest(
                "Welcome", "S", "B", TriggerEvent.ACCOUNT_CREATED, null, true);
        when(emailTemplateRepository.existsByNameIgnoreCase("Welcome")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> emailTemplateService.create(request));
        assertEquals(ConfigConstants.MSG_TEMPLATE_NAME_EXISTS, ex.getMessage());
    }

    @Test
    @DisplayName("update() applies new values")
    void update_appliesValues() {
        EmailTemplate existing = new EmailTemplate();
        existing.setId(1L);
        existing.setName("Old");
        when(emailTemplateRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(emailTemplateRepository.existsByNameIgnoreCaseAndIdNot("New", 1L)).thenReturn(false);

        EmailTemplateRequest request = new EmailTemplateRequest(
                "New", "Subj", "Body", TriggerEvent.PASSWORD_RESET, null, false);

        EmailTemplateResponse response = emailTemplateService.update(1L, request);

        assertEquals("New", response.getName());
        assertEquals(false, response.isActive());
    }

    @Test
    @DisplayName("findActiveByTrigger() returns matching active template")
    void findActiveByTrigger_returnsTemplate() {
        EmailTemplate t = new EmailTemplate();
        t.setName("Reset");
        t.setTriggerEvent(TriggerEvent.PASSWORD_RESET);
        t.setActive(true);
        when(emailTemplateRepository.findByTriggerEventAndIsActiveTrue(TriggerEvent.PASSWORD_RESET))
                .thenReturn(Optional.of(t));

        Optional<EmailTemplate> found = emailTemplateService.findActiveByTrigger(TriggerEvent.PASSWORD_RESET);

        assertEquals("Reset", found.orElseThrow().getName());
    }

    @Test
    @DisplayName("getById() throws ResourceNotFoundException when missing")
    void getById_throwsWhenMissing() {
        when(emailTemplateRepository.findById(42L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> emailTemplateService.getById(42L));
        assertEquals(ConfigConstants.MSG_EMAIL_TEMPLATE_NOT_FOUND, ex.getMessage());
    }
}
