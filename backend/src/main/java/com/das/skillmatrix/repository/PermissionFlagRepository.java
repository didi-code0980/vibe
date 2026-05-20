package com.das.skillmatrix.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.das.skillmatrix.entity.PermissionFlag;

@Repository
public interface PermissionFlagRepository extends JpaRepository<PermissionFlag, Long> {

    Optional<PermissionFlag> findByRoleAndFeatureKey(String role, String featureKey);

    List<PermissionFlag> findByRole(String role);
}
