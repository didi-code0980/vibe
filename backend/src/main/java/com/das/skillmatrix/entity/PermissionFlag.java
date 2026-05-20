package com.das.skillmatrix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "permission_flags",
        uniqueConstraints = @UniqueConstraint(columnNames = {"role", "feature_key"})
)
@Getter
@Setter
@NoArgsConstructor
public class PermissionFlag extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String role;

    @Column(name = "feature_key", nullable = false, length = 128)
    private String featureKey;

    @Column(nullable = false)
    private boolean enabled = false;
}
