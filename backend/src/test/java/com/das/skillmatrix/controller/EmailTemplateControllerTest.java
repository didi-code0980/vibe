package com.das.skillmatrix.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import com.das.skillmatrix.dto.request.EmailTemplateRequest;
import com.das.skillmatrix.dto.response.EmailTemplateResponse;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.entity.TriggerEvent;
import com.das.skillmatrix.exception.GlobalExceptionHandler;
import com.das.skillmatrix.security.JwtUtil;
import com.das.skillmatrix.service.CustomUserDetailsService;
import com.das.skillmatrix.service.EmailTemplateService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = EmailTemplateController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@WithMockUser(roles = "ADMIN")
class EmailTemplateControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    EmailTemplateService emailTemplateService;

    @MockBean
    JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    JwtUtil jwtUtil;

    @MockBean
    CustomUserDetailsService customUserDetailsService;

    private EmailTemplateResponse build(Long id, String name) {
        return EmailTemplateResponse.builder()
                .id(id)
                .name(name)
                .subject("S")
                .bodyHtml("B")
                .triggerEvent(TriggerEvent.ACCOUNT_CREATED)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("GET /api/admin/email-templates returns paged list")
    void list_returns200() throws Exception {
        PageResponse<EmailTemplateResponse> page = new PageResponse<>(
                List.of(build(1L, "Welcome")), 0, 20, 1L, 1, false, false);
        when(emailTemplateService.list(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/admin/email-templates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].name").value("Welcome"));
    }

    @Test
    @DisplayName("POST /api/admin/email-templates returns 201")
    void create_returns201() throws Exception {
        EmailTemplateRequest request = new EmailTemplateRequest(
                "Welcome", "S", "B", TriggerEvent.ACCOUNT_CREATED, null, true);
        when(emailTemplateService.create(any(EmailTemplateRequest.class))).thenReturn(build(1L, "Welcome"));

        mockMvc.perform(post("/api/admin/email-templates")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    @DisplayName("PUT /api/admin/email-templates/{id} returns 200")
    void update_returns200() throws Exception {
        EmailTemplateRequest request = new EmailTemplateRequest(
                "Welcome", "S", "B", TriggerEvent.ACCOUNT_CREATED, null, false);
        when(emailTemplateService.update(eq(1L), any())).thenReturn(build(1L, "Welcome"));

        mockMvc.perform(put("/api/admin/email-templates/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}
