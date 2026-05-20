package com.das.skillmatrix.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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
import com.das.skillmatrix.dto.response.NotificationResponse;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.dto.response.UnreadCountResponse;
import com.das.skillmatrix.exception.GlobalExceptionHandler;
import com.das.skillmatrix.security.JwtUtil;
import com.das.skillmatrix.service.CustomUserDetailsService;
import com.das.skillmatrix.service.NotificationService;

@WebMvcTest(controllers = NotificationController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@WithMockUser(username = "alice@example.com", roles = "USER")
class NotificationControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockBean
    NotificationService notificationService;

    @MockBean
    JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    JwtUtil jwtUtil;

    @MockBean
    CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("GET /api/notifications returns 200 + paged DTO")
    void listMine_returns200() throws Exception {
        NotificationResponse item = NotificationResponse.builder()
                .id(1L)
                .type("DOCUMENT_ASSIGNED")
                .title("New doc")
                .body("body")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        PageResponse<NotificationResponse> page = new PageResponse<>(
                List.of(item), 0, 20, 1L, 1, false, false);
        when(this.notificationService.listMyNotifications(anyString(), any(), any(Pageable.class)))
                .thenReturn(page);

        this.mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[0].id").value(1))
                .andExpect(jsonPath("$.data.items[0].title").value("New doc"))
                .andExpect(jsonPath("$.data.items[0].isRead").value(false));
    }

    @Test
    @DisplayName("GET /api/notifications?isRead=false passes filter to service")
    void listMine_forwardsIsReadFilter() throws Exception {
        PageResponse<NotificationResponse> page = new PageResponse<>(
                List.of(), 0, 20, 0L, 0, false, false);
        when(this.notificationService.listMyNotifications(anyString(), eq(false), any(Pageable.class)))
                .thenReturn(page);

        this.mockMvc.perform(get("/api/notifications").param("isRead", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items").isArray());
    }

    @Test
    @DisplayName("GET /api/notifications/unread-count returns {count}")
    void unreadCount_returnsCount() throws Exception {
        when(this.notificationService.countMyUnread(anyString()))
                .thenReturn(new UnreadCountResponse(4L));

        this.mockMvc.perform(get("/api/notifications/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.count").value(4));
    }

    @Test
    @DisplayName("PATCH /api/notifications/{id}/read returns updated DTO")
    void markRead_returnsUpdated() throws Exception {
        NotificationResponse updated = NotificationResponse.builder()
                .id(10L)
                .type("DOCUMENT_ASSIGNED")
                .title("New doc")
                .isRead(true)
                .createdAt(LocalDateTime.now())
                .build();
        when(this.notificationService.markOneAsRead(anyString(), eq(10L))).thenReturn(updated);

        this.mockMvc.perform(patch("/api/notifications/10/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(10))
                .andExpect(jsonPath("$.data.isRead").value(true));
    }

    @Test
    @DisplayName("PATCH /api/notifications/read-all returns updated-count payload")
    void markAllRead_returnsCount() throws Exception {
        when(this.notificationService.markAllAsRead(anyString())).thenReturn(3);

        this.mockMvc.perform(patch("/api/notifications/read-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.count").value(3));
    }
}
