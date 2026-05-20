package com.das.skillmatrix.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.das.skillmatrix.constants.ConfigConstants;
import com.das.skillmatrix.dto.request.EmailTemplateRequest;
import com.das.skillmatrix.dto.response.EmailTemplateResponse;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.entity.EmailTemplate;
import com.das.skillmatrix.entity.TriggerEvent;
import com.das.skillmatrix.exception.ResourceNotFoundException;
import com.das.skillmatrix.repository.EmailTemplateRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class EmailTemplateService {

    private final EmailTemplateRepository emailTemplateRepository;

    @Transactional(readOnly = true)
    public PageResponse<EmailTemplateResponse> list(Pageable pageable) {
        Page<EmailTemplate> page = this.emailTemplateRepository.findAll(pageable);
        List<EmailTemplateResponse> items = page.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                items,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext(),
                page.hasPrevious()
        );
    }

    @Transactional(readOnly = true)
    public EmailTemplateResponse getById(Long id) {
        EmailTemplate template = this.findTemplateById(id);
        return this.toResponse(template);
    }

    public EmailTemplateResponse create(EmailTemplateRequest request) {
        this.validateNameUnique(request.getName(), null);
        EmailTemplate template = new EmailTemplate();
        this.applyRequest(template, request);
        EmailTemplate saved = this.emailTemplateRepository.save(template);
        return this.toResponse(saved);
    }

    public EmailTemplateResponse update(Long id, EmailTemplateRequest request) {
        EmailTemplate template = this.findTemplateById(id);
        this.validateNameUnique(request.getName(), id);
        this.applyRequest(template, request);
        return this.toResponse(template);
    }

    @Transactional(readOnly = true)
    public Optional<EmailTemplate> findActiveByTrigger(TriggerEvent event) {
        return this.emailTemplateRepository.findByTriggerEventAndIsActiveTrue(event);
    }

    private EmailTemplate findTemplateById(Long id) {
        return this.emailTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ConfigConstants.MSG_EMAIL_TEMPLATE_NOT_FOUND));
    }

    private void validateNameUnique(String name, Long excludeId) {
        boolean exists = excludeId == null
                ? this.emailTemplateRepository.existsByNameIgnoreCase(name)
                : this.emailTemplateRepository.existsByNameIgnoreCaseAndIdNot(name, excludeId);
        if (exists) {
            throw new IllegalArgumentException(ConfigConstants.MSG_TEMPLATE_NAME_EXISTS);
        }
    }

    private void applyRequest(EmailTemplate template, EmailTemplateRequest request) {
        template.setName(request.getName().trim());
        template.setSubject(request.getSubject());
        template.setBodyHtml(request.getBodyHtml());
        template.setTriggerEvent(request.getTriggerEvent());
        template.setVariablesJson(request.getVariablesJson());
        template.setActive(Boolean.TRUE.equals(request.getIsActive()));
    }

    private EmailTemplateResponse toResponse(EmailTemplate template) {
        return EmailTemplateResponse.builder()
                .id(template.getId())
                .name(template.getName())
                .subject(template.getSubject())
                .bodyHtml(template.getBodyHtml())
                .triggerEvent(template.getTriggerEvent())
                .variablesJson(template.getVariablesJson())
                .isActive(template.isActive())
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
}
