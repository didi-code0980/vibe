package com.das.skillmatrix.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Pageable;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.das.skillmatrix.config.JwtAuthenticationFilter;
import com.das.skillmatrix.dto.response.AuditLogResponse;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.exception.GlobalExceptionHandler;
import com.das.skillmatrix.security.JwtUtil;
import com.das.skillmatrix.service.AuditLogQueryService;
import com.das.skillmatrix.service.CustomUserDetailsService;

@WebMvcTest(controllers = AuditLogController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@WithMockUser(roles = "ADMIN")
class AuditLogControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    AuditLogQueryService auditLogQueryService;

    @MockBean
    JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    JwtUtil jwtUtil;

    @MockBean
    CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("GET /api/admin/audit-logs returns 200 with paged data")
    void search_returns200() throws Exception {
        AuditLogResponse item = AuditLogResponse.builder()
                .logId(1L)
                .actorId(10L)
                .actorFullName("Alice")
                .action("LOGIN_SUCCESS")
                .entityType("USER")
                .entityId(10L)
                .createdAt(LocalDateTime.now())
                .build();
        PageResponse<AuditLogResponse> page = new PageResponse<>(
                List.of(item), 0, 20, 1L, 1, false, false);
        when(auditLogQueryService.search(any(), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/admin/audit-logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].action").value("LOGIN_SUCCESS"))
                .andExpect(jsonPath("$.data.items[0].actorFullName").value("Alice"));
    }
}
