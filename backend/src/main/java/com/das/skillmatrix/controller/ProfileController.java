package com.das.skillmatrix.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.das.skillmatrix.dto.request.UpdateProfileRequest;
import com.das.skillmatrix.dto.request.UpdateProfileSettingsRequest;
import com.das.skillmatrix.dto.response.ApiResponse;
import com.das.skillmatrix.dto.response.AssessmentHistoryItemResponse;
import com.das.skillmatrix.dto.response.AvatarUploadResponse;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.dto.response.ProfileResponse;
import com.das.skillmatrix.dto.response.ProfileSettingsResponse;
import com.das.skillmatrix.dto.response.ProfileTeamResponse;
import com.das.skillmatrix.service.ProfileService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getCurrentProfile(Authentication authentication) {
        ProfileResponse response = this.profileService.getCurrentProfile(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(response, true, null));
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> updateCurrentProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        ProfileResponse response = this.profileService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(new ApiResponse<>(response, true, null));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AvatarUploadResponse>> uploadAvatar(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        String avatarUrl = this.profileService.uploadAvatar(authentication.getName(), file);
        return ResponseEntity.ok(new ApiResponse<>(new AvatarUploadResponse(avatarUrl), true, null));
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/avatar")
    public ResponseEntity<ApiResponse<String>> removeAvatar(Authentication authentication) {
        this.profileService.removeAvatar(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>("Avatar removed.", true, null));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<ProfileSettingsResponse>> getSettings(Authentication authentication) {
        ProfileSettingsResponse response = this.profileService.getSettings(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(response, true, null));
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<ProfileSettingsResponse>> updateSettings(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileSettingsRequest request) {
        ProfileSettingsResponse response = this.profileService.updateSettings(authentication.getName(), request);
        return ResponseEntity.ok(new ApiResponse<>(response, true, null));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/assessment-history")
    public ResponseEntity<ApiResponse<PageResponse<AssessmentHistoryItemResponse>>> getAssessmentHistory(
            Authentication authentication,
            @PageableDefault(size = 20, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<AssessmentHistoryItemResponse> response = this.profileService
                .getAssessmentHistory(authentication.getName(), pageable);
        return ResponseEntity.ok(new ApiResponse<>(response, true, null));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/team")
    public ResponseEntity<ApiResponse<ProfileTeamResponse>> getMyTeam(Authentication authentication) {
        ProfileTeamResponse response = this.profileService.getMyTeam(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(response, true, null));
    }
}