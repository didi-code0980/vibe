package com.das.skillmatrix.controller;

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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.das.skillmatrix.dto.request.PositionCreateRequest;
import com.das.skillmatrix.dto.request.PositionFilterRequest;
import com.das.skillmatrix.dto.request.PositionUpdateRequest;
import com.das.skillmatrix.dto.response.ApiResponse;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.dto.response.PositionDetailResponse;
import com.das.skillmatrix.service.PositionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/positions")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PositionController {

    private final PositionService positionService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PositionDetailResponse>>> list(
            @ModelAttribute PositionFilterRequest filter,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<PositionDetailResponse> response = this.positionService.list(filter, pageable);
        return ResponseEntity.ok(new ApiResponse<>(response, true, null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PositionDetailResponse>> getDetail(@PathVariable Long id) {
        PositionDetailResponse response = this.positionService.getDetail(id);
        return ResponseEntity.ok(new ApiResponse<>(response, true, null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<PositionDetailResponse>> create(
            @Valid @RequestBody PositionCreateRequest request) {
        PositionDetailResponse response = this.positionService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(response, true, null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PositionDetailResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody PositionUpdateRequest request) {
        PositionDetailResponse response = this.positionService.update(id, request);
        return ResponseEntity.ok(new ApiResponse<>(response, true, null));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        this.positionService.delete(id);
        return ResponseEntity.ok(new ApiResponse<>("Position deleted", true, null));
    }
}
