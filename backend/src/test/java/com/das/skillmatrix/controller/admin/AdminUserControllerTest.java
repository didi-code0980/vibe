package com.das.skillmatrix.controller.admin;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.das.skillmatrix.config.JwtAuthenticationFilter;
import com.das.skillmatrix.dto.request.AdminUserFilterRequest;
import com.das.skillmatrix.dto.request.CreateUserRequest;
import com.das.skillmatrix.dto.request.UpdateUserStatusRequest;
import com.das.skillmatrix.dto.response.AdminUserListItemResponse;
import com.das.skillmatrix.dto.response.AuditLogResponse;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.dto.response.UserResponse;
import com.das.skillmatrix.entity.GeneralStatus;
import com.das.skillmatrix.exception.GlobalExceptionHandler;
import com.das.skillmatrix.security.JwtUtil;
import com.das.skillmatrix.service.AdminUserService;
import com.das.skillmatrix.service.AuditLogQueryService;
import com.das.skillmatrix.service.CustomUserDetailsService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = AdminUserController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class AdminUserControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    AdminUserService adminUserService;

    @MockBean
    AuditLogQueryService auditLogQueryService;

    @MockBean
    JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockBean
    JwtUtil jwtUtil;
    @MockBean
    CustomUserDetailsService customUserDetailsService;

    private static final LocalDateTime NOW = LocalDateTime.now();

    private AdminUserListItemResponse listItem(Long id, String email) {
        AdminUserListItemResponse r = new AdminUserListItemResponse();
        r.setUserId(id);
        r.setEmail(email);
        r.setFullName("User " + id);
        r.setPositionName("Engineer");
        r.setStatus(GeneralStatus.ACTIVE);
        r.setCreatedAt(NOW);
        return r;
    }

    // ===================== USM-01 LIST =====================

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("USM-01 GET /api/admin/users returns paged list for admin")
    void list_shouldReturnPagedList() throws Exception {
        PageResponse<AdminUserListItemResponse> page = new PageResponse<>(
                List.of(listItem(1L, "a@test.com"), listItem(2L, "b@test.com")),
                0, 20, 2L, 1, false, false);
        when(this.adminUserService.list(any(AdminUserFilterRequest.class), any(Pageable.class))).thenReturn(page);

        this.mockMvc.perform(get("/api/admin/users?page=0&size=20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items.length()").value(2))
                .andExpect(jsonPath("$.data.items[0].email").value("a@test.com"))
                .andExpect(jsonPath("$.data.items[0].positionName").value("Engineer"));
    }

    @Test
    @WithMockUser(roles = "MANAGER_CAREER")
    @DisplayName("USM-01 non-admin gets 403")
    void list_shouldForbidNonAdmin() throws Exception {
        this.mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());
    }

    // ===================== USM-05 CREATE =====================

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("USM-05 POST /api/admin/users returns 201 with created user")
    void create_shouldReturnCreated() throws Exception {
        CreateUserRequest req = new CreateUserRequest();
        req.setEmail("new@test.com");
        req.setFullName("New Person");
        req.setRole("STAFF");
        req.setPositionIds(List.of(1L));
        req.setTeamId(1L);

        UserResponse resp = new UserResponse();
        resp.setUserId(99L);
        resp.setEmail("new@test.com");
        resp.setFullName("New Person");
        resp.setStatus(GeneralStatus.ACTIVE);

        when(this.adminUserService.create(any(CreateUserRequest.class))).thenReturn(resp);

        this.mockMvc.perform(post("/api/admin/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(this.objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.userId").value(99))
                .andExpect(jsonPath("$.data.email").value("new@test.com"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("USM-05 POST /api/admin/users rejects blank fullName")
    void create_shouldReturn400_whenFullNameBlank() throws Exception {
        CreateUserRequest req = new CreateUserRequest();
        req.setEmail("new@test.com");
        req.setFullName("");
        req.setRole("STAFF");

        this.mockMvc.perform(post("/api/admin/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(this.objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    @DisplayName("USM-05 POST /api/admin/users is forbidden for non-admin")
    void create_shouldForbidNonAdmin() throws Exception {
        CreateUserRequest req = new CreateUserRequest();
        req.setEmail("new@test.com");
        req.setFullName("X");
        req.setRole("STAFF");

        this.mockMvc.perform(post("/api/admin/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(this.objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    // ===================== USM-03 LOCK / UNLOCK =====================

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("USM-03 PATCH /api/admin/users/{id}/status locks user")
    void lockUser_shouldReturnOk() throws Exception {
        UpdateUserStatusRequest req = new UpdateUserStatusRequest();
        req.setStatus("LOCKED");

        UserResponse resp = new UserResponse();
        resp.setUserId(7L);
        resp.setStatus(GeneralStatus.LOCKED);
        when(this.adminUserService.updateStatus(eq(7L), any(UpdateUserStatusRequest.class))).thenReturn(resp);

        this.mockMvc.perform(patch("/api/admin/users/7/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(this.objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("LOCKED"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("USM-03 PATCH rejects invalid status value with 400")
    void lockUser_shouldReturn400_whenStatusInvalid() throws Exception {
        UpdateUserStatusRequest req = new UpdateUserStatusRequest();
        req.setStatus("BANNED");

        this.mockMvc.perform(patch("/api/admin/users/7/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(this.objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    // ===================== USM-04 DELETE =====================

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("USM-04 DELETE /api/admin/users/{id} returns 200")
    void deleteUser_shouldReturnOk() throws Exception {
        this.mockMvc.perform(delete("/api/admin/users/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        verify(this.adminUserService).softDelete(7L);
    }

    // ===================== USM-02 ACTIVITY =====================

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("USM-02 GET /api/admin/users/{id}/activity returns audit logs")
    void getActivity_shouldReturnAuditLogs() throws Exception {
        AuditLogResponse log = AuditLogResponse.builder()
                .logId(1L).actorId(7L).action("USER_LOCKED").entityType("USER").entityId(7L)
                .createdAt(NOW).build();
        PageResponse<AuditLogResponse> page = new PageResponse<>(List.of(log), 0, 20, 1L, 1, false, false);
        when(this.adminUserService.findActivityForUser(eq(7L), any(Pageable.class))).thenReturn(page);

        this.mockMvc.perform(get("/api/admin/users/7/activity?page=0&size=20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].action").value("USER_LOCKED"));
    }
}
