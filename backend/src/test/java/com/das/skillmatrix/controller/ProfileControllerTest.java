package com.das.skillmatrix.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.Collections;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.das.skillmatrix.config.JwtAuthenticationFilter;
import com.das.skillmatrix.dto.request.UpdateProfileRequest;
import com.das.skillmatrix.dto.request.UpdateProfileSettingsRequest;
import com.das.skillmatrix.dto.response.AssessmentHistoryItemResponse;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.dto.response.ProfileResponse;
import com.das.skillmatrix.dto.response.ProfileSettingsResponse;
import com.das.skillmatrix.dto.response.ProfileTeamResponse;
import com.das.skillmatrix.entity.GeneralStatus;
import com.das.skillmatrix.entity.Language;
import com.das.skillmatrix.exception.GlobalExceptionHandler;
import com.das.skillmatrix.security.JwtUtil;
import com.das.skillmatrix.service.CustomUserDetailsService;
import com.das.skillmatrix.service.ProfileService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = ProfileController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@WithMockUser(username = "alice@example.com")
class ProfileControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    ProfileService profileService;

    @MockBean
    JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    JwtUtil jwtUtil;

    @MockBean
    CustomUserDetailsService customUserDetailsService;

    private ProfileResponse buildProfileResponse() {
        return ProfileResponse.builder()
                .userId(1L)
                .email("alice@example.com")
                .fullName("Alice")
                .phone("0123456789")
                .role("STAFF")
                .status(GeneralStatus.ACTIVE)
                .mustChangePassword(false)
                .notificationEmail(true)
                .language(Language.EN)
                .positions(Collections.emptyList())
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("GET /api/profile returns 200 with profile data")
    void getCurrentProfile_returnsProfile() throws Exception {
        when(profileService.getCurrentProfile(anyString())).thenReturn(buildProfileResponse());

        mockMvc.perform(get("/api/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("alice@example.com"))
                .andExpect(jsonPath("$.data.fullName").value("Alice"));
    }

    @Test
    @DisplayName("PUT /api/profile returns 200 and updated profile")
    void updateCurrentProfile_returnsUpdated() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest("Alice Updated", "0987654321");
        when(profileService.updateProfile(anyString(), any(UpdateProfileRequest.class)))
                .thenReturn(buildProfileResponse());

        mockMvc.perform(put("/api/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("PUT /api/profile returns 400 when full name is blank")
    void updateCurrentProfile_returns400_whenInvalid() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest("", "0987654321");

        mockMvc.perform(put("/api/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/profile/avatar returns 200 with new avatar URL")
    void uploadAvatar_returnsNewUrl() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.png", "image/png", new byte[]{1, 2, 3});
        when(profileService.uploadAvatar(anyString(), any())).thenReturn("/static/avatars/new.png");

        mockMvc.perform(multipart("/api/profile/avatar").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.avatarUrl").value("/static/avatars/new.png"));
    }

    @Test
    @DisplayName("GET /api/profile/settings returns 200 with current settings")
    void getSettings_returnsValues() throws Exception {
        when(profileService.getSettings(anyString()))
                .thenReturn(new ProfileSettingsResponse(true, Language.EN));

        mockMvc.perform(get("/api/profile/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.notificationEmail").value(true))
                .andExpect(jsonPath("$.data.language").value("EN"));
    }

    @Test
    @DisplayName("PUT /api/profile/settings returns 200 and saves values")
    void updateSettings_returns200() throws Exception {
        UpdateProfileSettingsRequest request = new UpdateProfileSettingsRequest(false, Language.VI);
        when(profileService.updateSettings(anyString(), any(UpdateProfileSettingsRequest.class)))
                .thenReturn(new ProfileSettingsResponse(false, Language.VI));

        mockMvc.perform(put("/api/profile/settings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.notificationEmail").value(false))
                .andExpect(jsonPath("$.data.language").value("VI"));
    }

    @Test
    @DisplayName("GET /api/profile/assessment-history returns 200 with paged data")
    void getAssessmentHistory_returnsPaged() throws Exception {
        AssessmentHistoryItemResponse item = AssessmentHistoryItemResponse.builder()
                .evaluationId(100L)
                .skillId(11L)
                .skillName("Java")
                .selfScore(4)
                .assessedAt(LocalDateTime.now())
                .build();
        PageResponse<AssessmentHistoryItemResponse> page = new PageResponse<>(
                List.of(item), 0, 20, 1L, 1, false, false);

        when(profileService.getAssessmentHistory(anyString(), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/profile/assessment-history?page=0&size=20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].skillName").value("Java"))
                .andExpect(jsonPath("$.data.items[0].selfScore").value(4));
    }

    @Test
    @DisplayName("GET /api/profile/team returns 200 with team info")
    void getMyTeam_returnsTeamInfo() throws Exception {
        ProfileTeamResponse response = ProfileTeamResponse.builder()
                .teamId(7L)
                .teamName("Falcons")
                .managerFullName("Bob")
                .teammates(Collections.emptyList())
                .build();
        when(profileService.getMyTeam(anyString())).thenReturn(response);

        mockMvc.perform(get("/api/profile/team"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.teamId").value(7))
                .andExpect(jsonPath("$.data.teamName").value("Falcons"))
                .andExpect(jsonPath("$.data.managerFullName").value("Bob"));
    }

    @Test
    @DisplayName("GET /api/profile/team returns 404 when no team")
    void getMyTeam_returns404_whenNoTeam() throws Exception {
        when(profileService.getMyTeam(anyString()))
                .thenThrow(new com.das.skillmatrix.exception.ResourceNotFoundException("TEAM_NOT_FOUND"));

        mockMvc.perform(get("/api/profile/team"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }
}