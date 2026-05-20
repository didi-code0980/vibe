package com.das.skillmatrix.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.das.skillmatrix.dto.request.SmtpConfigRequest;
import com.das.skillmatrix.dto.request.UpdateNotificationRulesRequest;
import com.das.skillmatrix.dto.request.UpdatePermissionsRequest;
import com.das.skillmatrix.dto.request.UpdateRatingScaleRequest;
import com.das.skillmatrix.dto.response.ApiResponse;
import com.das.skillmatrix.dto.response.NotificationRulesResponse;
import com.das.skillmatrix.dto.response.PermissionMatrixResponse;
import com.das.skillmatrix.dto.response.RatingScaleResponse;
import com.das.skillmatrix.dto.response.RoleDescriptorResponse;
import com.das.skillmatrix.dto.response.SmtpConfigResponse;
import com.das.skillmatrix.service.NotificationRuleService;
import com.das.skillmatrix.service.PermissionMatrixService;
import com.das.skillmatrix.service.RatingScaleService;
import com.das.skillmatrix.service.SmtpConfigService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/config")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminConfigController {

    private final PermissionMatrixService permissionMatrixService;

    private final RatingScaleService ratingScaleService;

    private final SmtpConfigService smtpConfigService;

    private final NotificationRuleService notificationRuleService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<RoleDescriptorResponse>> getRoles() {
        return ResponseEntity.ok(new ApiResponse<>(this.permissionMatrixService.getRoles(), true, null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/permissions")
    public ResponseEntity<ApiResponse<PermissionMatrixResponse>> getPermissions() {
        return ResponseEntity.ok(new ApiResponse<>(this.permissionMatrixService.getMatrix(), true, null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/permissions")
    public ResponseEntity<ApiResponse<PermissionMatrixResponse>> updatePermissions(
            @Valid @RequestBody UpdatePermissionsRequest request) {
        PermissionMatrixResponse response = this.permissionMatrixService.updateMatrix(request);
        return ResponseEntity.ok(new ApiResponse<>(response, true, null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/rating-scale")
    public ResponseEntity<ApiResponse<RatingScaleResponse>> getRatingScale() {
        return ResponseEntity.ok(new ApiResponse<>(this.ratingScaleService.getAll(), true, null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/rating-scale")
    public ResponseEntity<ApiResponse<RatingScaleResponse>> updateRatingScale(
            @Valid @RequestBody UpdateRatingScaleRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(this.ratingScaleService.update(request), true, null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/smtp")
    public ResponseEntity<ApiResponse<SmtpConfigResponse>> getSmtp() {
        return ResponseEntity.ok(new ApiResponse<>(this.smtpConfigService.getConfig(), true, null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/smtp")
    public ResponseEntity<ApiResponse<SmtpConfigResponse>> updateSmtp(
            @Valid @RequestBody SmtpConfigRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(this.smtpConfigService.updateConfig(request), true, null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/smtp/test")
    public ResponseEntity<ApiResponse<String>> sendSmtpTest(Authentication authentication) {
        this.smtpConfigService.sendTestEmail(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>("Test email sent", true, null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/notification-rules")
    public ResponseEntity<ApiResponse<NotificationRulesResponse>> getNotificationRules() {
        return ResponseEntity.ok(new ApiResponse<>(this.notificationRuleService.getAll(), true, null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/notification-rules")
    public ResponseEntity<ApiResponse<NotificationRulesResponse>> updateNotificationRules(
            @Valid @RequestBody UpdateNotificationRulesRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(this.notificationRuleService.update(request), true, null));
    }
}
