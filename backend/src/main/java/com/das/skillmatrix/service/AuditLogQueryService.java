package com.das.skillmatrix.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.das.skillmatrix.dto.request.AuditLogFilterRequest;
import com.das.skillmatrix.dto.response.AuditLogResponse;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.entity.AuditLog;
import com.das.skillmatrix.entity.User;
import com.das.skillmatrix.repository.AuditLogRepository;
import com.das.skillmatrix.repository.UserRepository;
import com.das.skillmatrix.repository.specification.AuditLogSpecification;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AuditLogQueryService {

    private final AuditLogRepository auditLogRepository;

    private final UserRepository userRepository;

    public PageResponse<AuditLogResponse> search(AuditLogFilterRequest filter, Pageable pageable) {
        Specification<AuditLog> spec = AuditLogSpecification.filter(filter);
        Page<AuditLog> page = this.auditLogRepository.findAll(spec, pageable);
        Map<Long, User> actorById = this.loadActorsByIds(page.getContent());
        List<AuditLogResponse> items = page.getContent().stream()
                .map(log -> this.toResponse(log, actorById.get(log.getUserId())))
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

    private Map<Long, User> loadActorsByIds(List<AuditLog> logs) {
        List<Long> ids = logs.stream()
                .map(AuditLog::getUserId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();
        if (ids.isEmpty()) {
            return Map.of();
        }
        List<User> users = this.userRepository.findAllById(ids);
        Map<Long, User> map = new HashMap<>();
        for (User u : users) {
            map.put(u.getUserId(), u);
        }
        return map;
    }

    private AuditLogResponse toResponse(AuditLog log, User actor) {
        return AuditLogResponse.builder()
                .logId(log.getLogId())
                .actorId(log.getUserId())
                .actorFullName(actor != null ? actor.getFullName() : null)
                .actorEmail(actor != null ? actor.getEmail() : log.getUserEmail())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .oldData(log.getOldData())
                .newData(log.getNewData())
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
