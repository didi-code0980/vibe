package com.das.skillmatrix.controller.admin;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.das.skillmatrix.dto.request.AdminUserFilterRequest;
import com.das.skillmatrix.dto.request.CreateUserRequest;
import com.das.skillmatrix.dto.request.UpdateUserStatusRequest;
import com.das.skillmatrix.dto.response.AdminUserListItemResponse;
import com.das.skillmatrix.dto.response.ApiResponse;
import com.das.skillmatrix.dto.response.AuditLogResponse;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.dto.response.UserResponse;
import com.das.skillmatrix.service.AdminUserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminUserListItemResponse>>> list(
            @ModelAttribute AdminUserFilterRequest filter,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<AdminUserListItemResponse> data = this.adminUserService.list(filter, pageable);
        return ResponseEntity.ok(new ApiResponse<>(data, true, null));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> create(@Valid @RequestBody CreateUserRequest req) {
        UserResponse data = this.adminUserService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(data, true, null));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateUserStatusRequest req) {
        UserResponse data = this.adminUserService.updateStatus(id, req);
        return ResponseEntity.ok(new ApiResponse<>(data, true, null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") Long id) {
        this.adminUserService.softDelete(id);
        return ResponseEntity.ok(new ApiResponse<>(null, true, null));
    }

    @GetMapping("/{id}/activity")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> activity(
            @PathVariable("id") Long id,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<AuditLogResponse> data = this.adminUserService.findActivityForUser(id, pageable);
        return ResponseEntity.ok(new ApiResponse<>(data, true, null));
    }
}
