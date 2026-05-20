package com.das.skillmatrix.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.das.skillmatrix.constants.ConfigConstants;
import com.das.skillmatrix.dto.request.UpdatePermissionsRequest;
import com.das.skillmatrix.dto.request.UpdatePermissionsRequest.PermissionFlagEntry;
import com.das.skillmatrix.dto.response.PermissionMatrixResponse;
import com.das.skillmatrix.dto.response.PermissionMatrixResponse.Entry;
import com.das.skillmatrix.dto.response.RoleDescriptorResponse;
import com.das.skillmatrix.dto.response.RoleDescriptorResponse.RoleEntry;
import com.das.skillmatrix.entity.PermissionFlag;
import com.das.skillmatrix.repository.PermissionFlagRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class PermissionMatrixService {

    private final PermissionFlagRepository permissionFlagRepository;

    @Transactional(readOnly = true)
    public RoleDescriptorResponse getRoles() {
        List<RoleEntry> entries = ConfigConstants.ROLES.stream()
                .map(role -> RoleEntry.builder()
                        .name(role)
                        .description(this.describeRole(role))
                        .build())
                .collect(Collectors.toList());
        return RoleDescriptorResponse.builder().roles(entries).build();
    }

    @Transactional(readOnly = true)
    public PermissionMatrixResponse getMatrix() {
        List<PermissionFlag> flags = this.permissionFlagRepository.findAll();
        List<Entry> entries = flags.stream()
                .map(f -> Entry.builder()
                        .role(f.getRole())
                        .featureKey(f.getFeatureKey())
                        .enabled(f.isEnabled())
                        .build())
                .collect(Collectors.toList());
        return PermissionMatrixResponse.builder()
                .roles(ConfigConstants.ROLES)
                .featureKeys(ConfigConstants.FEATURE_KEYS)
                .flags(entries)
                .build();
    }

    public PermissionMatrixResponse updateMatrix(UpdatePermissionsRequest request) {
        for (PermissionFlagEntry entry : request.getFlags()) {
            this.validateEntry(entry);
            PermissionFlag flag = this.permissionFlagRepository
                    .findByRoleAndFeatureKey(entry.getRole(), entry.getFeatureKey())
                    .orElseGet(PermissionFlag::new);
            flag.setRole(entry.getRole());
            flag.setFeatureKey(entry.getFeatureKey());
            flag.setEnabled(Boolean.TRUE.equals(entry.getEnabled()));
            this.permissionFlagRepository.save(flag);
        }
        return this.getMatrix();
    }

    @Transactional(readOnly = true)
    public boolean hasFeature(String role, String featureKey) {
        return this.permissionFlagRepository.findByRoleAndFeatureKey(role, featureKey)
                .map(PermissionFlag::isEnabled)
                .orElse(false);
    }

    private void validateEntry(PermissionFlagEntry entry) {
        if (entry.getRole() == null || !ConfigConstants.ROLES.contains(entry.getRole())) {
            throw new IllegalArgumentException(ConfigConstants.MSG_INVALID_ROLE);
        }
        if (entry.getFeatureKey() == null
                || !ConfigConstants.FEATURE_KEYS.contains(entry.getFeatureKey())) {
            throw new IllegalArgumentException(ConfigConstants.MSG_INVALID_FEATURE_KEY);
        }
    }

    private String describeRole(String role) {
        switch (role) {
            case ConfigConstants.ROLE_ADMIN:
                return "Full access to all data and configuration.";
            case ConfigConstants.ROLE_MANAGER_CAREER:
                return "Manages teams within an assigned Career.";
            case ConfigConstants.ROLE_MANAGER_DEPARTMENT:
                return "Manages teams within an assigned Department.";
            case ConfigConstants.ROLE_MANAGER_TEAM:
                return "Manages a single Team.";
            case ConfigConstants.ROLE_STAFF:
                return "Self-service: own profile, assessments, learning.";
            default:
                return role;
        }
    }
}
