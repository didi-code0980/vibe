package com.das.skillmatrix.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.das.skillmatrix.dto.response.ApiResponse;
import com.das.skillmatrix.dto.response.NotificationResponse;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.dto.response.UnreadCountResponse;
import com.das.skillmatrix.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> listMine(
            Authentication authentication,
            @RequestParam(value = "isRead", required = false) Boolean isRead,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<NotificationResponse> response = this.notificationService
                .listMyNotifications(authentication.getName(), isRead, pageable);
        return ResponseEntity.ok(new ApiResponse<>(response, true, null));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> unreadCount(Authentication authentication) {
        UnreadCountResponse response = this.notificationService
                .countMyUnread(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(response, true, null));
    }

    @PreAuthorize("@auth.isNotificationOwner(#id)")
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markRead(
            Authentication authentication,
            @PathVariable("id") Long id) {
        NotificationResponse response = this.notificationService
                .markOneAsRead(authentication.getName(), id);
        return ResponseEntity.ok(new ApiResponse<>(response, true, null));
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> markAllRead(Authentication authentication) {
        int updated = this.notificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(new UnreadCountResponse(updated), true, null));
    }
}
