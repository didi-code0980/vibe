package com.das.skillmatrix.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.das.skillmatrix.entity.AuditLog;
import com.das.skillmatrix.repository.AuditLogRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Async
    public void log(Long actorId, String action, String entityType, Long entityId,
                    Object oldData, Object newData) {
        try {
            AuditLog entry = new AuditLog();
            entry.setUserId(actorId);
            entry.setAction(action);
            entry.setEntityType(entityType);
            entry.setEntityId(entityId);
            entry.setOldData(toJson(oldData));
            entry.setNewData(toJson(newData));
            auditLogRepository.save(entry);
        } catch (Exception e) {
            log.info("AUDIT actor={} action={} entityType={} entityId={}", actorId, action, entityType, entityId);
        }
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return obj.toString();
        }
    }
}
