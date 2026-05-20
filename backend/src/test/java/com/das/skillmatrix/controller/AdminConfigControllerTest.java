package com.das.skillmatrix.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
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
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.das.skillmatrix.config.JwtAuthenticationFilter;
import com.das.skillmatrix.dto.request.SmtpConfigRequest;
import com.das.skillmatrix.dto.request.UpdateRatingScaleRequest;
import com.das.skillmatrix.dto.request.UpdateRatingScaleRequest.RatingScaleEntry;
import com.das.skillmatrix.dto.response.NotificationRulesResponse;
import com.das.skillmatrix.dto.response.PermissionMatrixResponse;
import com.das.skillmatrix.dto.response.RatingScaleResponse;
import com.das.skillmatrix.dto.response.RatingScaleResponse.RatingScaleItem;
import com.das.skillmatrix.dto.response.RoleDescriptorResponse;
import com.das.skillmatrix.dto.response.SmtpConfigResponse;
import com.das.skillmatrix.exception.GlobalExceptionHandler;
import com.das.skillmatrix.security.JwtUtil;
import com.das.skillmatrix.service.CustomUserDetailsService;
import com.das.skillmatrix.service.NotificationRuleService;
import com.das.skillmatrix.service.PermissionMatrixService;
import com.das.skillmatrix.service.RatingScaleService;
import com.das.skillmatrix.service.SmtpConfigService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = AdminConfigController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@WithMockUser(username = "admin@example.com", roles = "ADMIN")
class AdminConfigControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    PermissionMatrixService permissionMatrixService;

    @MockBean
    RatingScaleService ratingScaleService;

    @MockBean
    SmtpConfigService smtpConfigService;

    @MockBean
    NotificationRuleService notificationRuleService;

    @MockBean
    JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    JwtUtil jwtUtil;

    @MockBean
    CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("GET /api/admin/config/roles returns roles")
    void getRoles_returns200() throws Exception {
        when(permissionMatrixService.getRoles()).thenReturn(
                RoleDescriptorResponse.builder().roles(List.of()).build());

        mockMvc.perform(get("/api/admin/config/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("GET /api/admin/config/permissions returns matrix")
    void getPermissions_returns200() throws Exception {
        when(permissionMatrixService.getMatrix()).thenReturn(
                PermissionMatrixResponse.builder().roles(List.of()).featureKeys(List.of()).flags(List.of()).build());

        mockMvc.perform(get("/api/admin/config/permissions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("GET /api/admin/config/rating-scale returns 5 items")
    void getRatingScale_returns200() throws Exception {
        when(ratingScaleService.getAll()).thenReturn(
                RatingScaleResponse.builder().items(List.of(
                        RatingScaleItem.builder().level(1).label("A").build(),
                        RatingScaleItem.builder().level(2).label("B").build(),
                        RatingScaleItem.builder().level(3).label("C").build(),
                        RatingScaleItem.builder().level(4).label("D").build(),
                        RatingScaleItem.builder().level(5).label("E").build()))
                        .build());

        mockMvc.perform(get("/api/admin/config/rating-scale"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items.length()").value(5));
    }

    @Test
    @DisplayName("PUT /api/admin/config/rating-scale returns 400 when invalid")
    void updateRatingScale_returns400() throws Exception {
        UpdateRatingScaleRequest request = new UpdateRatingScaleRequest(
                List.of(new RatingScaleEntry(1, "Beginner", null)));

        mockMvc.perform(put("/api/admin/config/rating-scale")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/admin/config/smtp returns 200")
    void updateSmtp_returns200() throws Exception {
        SmtpConfigRequest request = new SmtpConfigRequest(
                "smtp.x.com", 587, "u", "p", "from@x.com", "From", true);
        when(smtpConfigService.updateConfig(any(SmtpConfigRequest.class))).thenReturn(
                SmtpConfigResponse.builder().host("smtp.x.com").port(587).build());

        mockMvc.perform(put("/api/admin/config/smtp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.host").value("smtp.x.com"));
    }

    @Test
    @DisplayName("POST /api/admin/config/smtp/test returns 200")
    void sendSmtpTest_returns200() throws Exception {
        doNothing().when(smtpConfigService).sendTestEmail(anyString());

        mockMvc.perform(post("/api/admin/config/smtp/test"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/admin/config/notification-rules returns 200")
    void getNotificationRules_returns200() throws Exception {
        when(notificationRuleService.getAll()).thenReturn(
                NotificationRulesResponse.builder().rules(List.of()).build());

        mockMvc.perform(get("/api/admin/config/notification-rules"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
