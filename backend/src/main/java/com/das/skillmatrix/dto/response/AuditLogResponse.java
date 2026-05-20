package com.das.skillmatrix.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private Long logId;

    private Long actorId;

    private String actorFullName;

    private String actorEmail;

    private String action;

    private String entityType;

    private Long entityId;

    private String oldData;

    private String newData;

    private String ipAddress;

    private String userAgent;

    private LocalDateTime createdAt;
}
