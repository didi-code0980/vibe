package com.das.skillmatrix.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.das.skillmatrix.dto.request.AuditLogFilterRequest;
import com.das.skillmatrix.dto.response.AuditLogResponse;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.entity.AuditLog;
import com.das.skillmatrix.entity.User;
import com.das.skillmatrix.repository.AuditLogRepository;
import com.das.skillmatrix.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AuditLogQueryServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuditLogQueryService auditLogQueryService;

    private AuditLog logRow;

    private User actor;

    private AuditLog buildLog(Long id, Long actorId, String action) {
        AuditLog log = new AuditLog();
        log.setLogId(id);
        log.setUserId(actorId);
        log.setAction(action);
        log.setEntityType("USER");
        log.setEntityId(5L);
        log.setCreatedAt(LocalDateTime.now());
        return log;
    }

    @Test
    @DisplayName("search() returns paged enriched response with actor name")
    void search_enrichesActor() {
        logRow = buildLog(1L, 10L, "LOGIN_SUCCESS");
        actor = new User();
        actor.setUserId(10L);
        actor.setFullName("Alice");
        actor.setEmail("alice@example.com");

        Pageable pageable = PageRequest.of(0, 10);
        Page<AuditLog> page = new PageImpl<>(List.of(logRow), pageable, 1);

        when(auditLogRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);
        when(userRepository.findAllById(anyList())).thenReturn(List.of(actor));

        PageResponse<AuditLogResponse> response = auditLogQueryService.search(
                new AuditLogFilterRequest(), pageable);

        assertEquals(1, response.getItems().size());
        assertEquals("Alice", response.getItems().get(0).getActorFullName());
        assertEquals("LOGIN_SUCCESS", response.getItems().get(0).getAction());
    }

    @Test
    @DisplayName("search() handles logs with null actor id (system events)")
    void search_handlesNullActor() {
        logRow = buildLog(1L, null, "SCHEDULED_CLEANUP");

        Pageable pageable = PageRequest.of(0, 10);
        Page<AuditLog> page = new PageImpl<>(List.of(logRow), pageable, 1);

        when(auditLogRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        PageResponse<AuditLogResponse> response = auditLogQueryService.search(
                new AuditLogFilterRequest(), pageable);

        assertEquals(1, response.getItems().size());
        assertNull(response.getItems().get(0).getActorFullName());
    }
}
