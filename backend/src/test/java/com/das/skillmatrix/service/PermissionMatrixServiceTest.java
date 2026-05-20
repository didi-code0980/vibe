package com.das.skillmatrix.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.das.skillmatrix.constants.ConfigConstants;
import com.das.skillmatrix.dto.request.UpdatePermissionsRequest;
import com.das.skillmatrix.dto.request.UpdatePermissionsRequest.PermissionFlagEntry;
import com.das.skillmatrix.entity.PermissionFlag;
import com.das.skillmatrix.repository.PermissionFlagRepository;

@ExtendWith(MockitoExtension.class)
class PermissionMatrixServiceTest {

    @Mock
    private PermissionFlagRepository permissionFlagRepository;

    @InjectMocks
    private PermissionMatrixService permissionMatrixService;

    @Test
    @DisplayName("getRoles() returns all defined roles with descriptions")
    void getRoles_returnsAll() {
        assertEquals(ConfigConstants.ROLES.size(),
                permissionMatrixService.getRoles().getRoles().size());
    }

    @Test
    @DisplayName("hasFeature() returns false when flag absent")
    void hasFeature_falseWhenAbsent() {
        when(permissionFlagRepository.findByRoleAndFeatureKey("MANAGER_TEAM",
                ConfigConstants.FEATURE_CROSS_TEAM_RESOURCE_MATCH))
                .thenReturn(Optional.empty());

        assertFalse(permissionMatrixService.hasFeature("MANAGER_TEAM",
                ConfigConstants.FEATURE_CROSS_TEAM_RESOURCE_MATCH));
    }

    @Test
    @DisplayName("hasFeature() returns flag value when present")
    void hasFeature_readsFlag() {
        PermissionFlag flag = new PermissionFlag();
        flag.setRole("MANAGER_TEAM");
        flag.setFeatureKey(ConfigConstants.FEATURE_CROSS_TEAM_RESOURCE_MATCH);
        flag.setEnabled(true);
        when(permissionFlagRepository.findByRoleAndFeatureKey("MANAGER_TEAM",
                ConfigConstants.FEATURE_CROSS_TEAM_RESOURCE_MATCH))
                .thenReturn(Optional.of(flag));

        assertTrue(permissionMatrixService.hasFeature("MANAGER_TEAM",
                ConfigConstants.FEATURE_CROSS_TEAM_RESOURCE_MATCH));
    }

    @Test
    @DisplayName("updateMatrix() rejects unknown role")
    void updateMatrix_rejectsUnknownRole() {
        UpdatePermissionsRequest request = new UpdatePermissionsRequest(List.of(
                new PermissionFlagEntry("UNKNOWN", ConfigConstants.FEATURE_CROSS_TEAM_RESOURCE_MATCH, true)));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> permissionMatrixService.updateMatrix(request));
        assertEquals(ConfigConstants.MSG_INVALID_ROLE, ex.getMessage());
    }

    @Test
    @DisplayName("updateMatrix() rejects unknown feature key")
    void updateMatrix_rejectsUnknownFeatureKey() {
        UpdatePermissionsRequest request = new UpdatePermissionsRequest(List.of(
                new PermissionFlagEntry("ADMIN", "MADE_UP_FEATURE", true)));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> permissionMatrixService.updateMatrix(request));
        assertEquals(ConfigConstants.MSG_INVALID_FEATURE_KEY, ex.getMessage());
    }

    @Test
    @DisplayName("updateMatrix() upserts a permission flag")
    void updateMatrix_upserts() {
        UpdatePermissionsRequest request = new UpdatePermissionsRequest(List.of(
                new PermissionFlagEntry("MANAGER_TEAM",
                        ConfigConstants.FEATURE_CROSS_TEAM_RESOURCE_MATCH,
                        true)));

        when(permissionFlagRepository.findByRoleAndFeatureKey("MANAGER_TEAM",
                ConfigConstants.FEATURE_CROSS_TEAM_RESOURCE_MATCH))
                .thenReturn(Optional.empty());
        when(permissionFlagRepository.save(any(PermissionFlag.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(permissionFlagRepository.findAll()).thenReturn(List.of());

        permissionMatrixService.updateMatrix(request);
    }
}
