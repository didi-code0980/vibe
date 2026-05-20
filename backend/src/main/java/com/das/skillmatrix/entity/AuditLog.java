package com.das.skillmatrix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
public class AuditLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    private Long userId;
    private String userEmail;

    private String action; // CREATE_CAREER, UPDATE_DEPARTMENT, ...
    private String entityType; // CAREER, DEPARTMENT, TEAM, ...
    private Long entityId;

    @Column(columnDefinition = "TEXT")
    private String metadata; // JSON bổ sung

    @Column(columnDefinition = "TEXT")
    private String oldData;

    @Column(columnDefinition = "TEXT")
    private String newData;

    private String userAgent;

    private String ipAddress;
}