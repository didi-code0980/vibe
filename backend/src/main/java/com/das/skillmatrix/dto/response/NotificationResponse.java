package com.das.skillmatrix.dto.response;

import java.time.LocalDateTime;

import com.das.skillmatrix.entity.Notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private Long id;

    private String type;

    private String title;

    private String body;

    private String relatedEntityType;

    private Long relatedEntityId;

    private boolean isRead;

    private LocalDateTime createdAt;

    public static NotificationResponse from(Notification source) {
        return NotificationResponse.builder()
                .id(source.getNotificationId())
                .type(source.getType())
                .title(source.getTitle())
                .body(source.getBody())
                .relatedEntityType(source.getRelatedEntityType())
                .relatedEntityId(source.getRelatedEntityId())
                .isRead(source.isRead())
                .createdAt(source.getCreatedAt())
                .build();
    }
}
