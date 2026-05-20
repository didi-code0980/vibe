package com.das.skillmatrix.dto.response;

import java.time.LocalDateTime;

import com.das.skillmatrix.entity.TriggerEvent;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailTemplateResponse {

    private Long id;

    private String name;

    private String subject;

    private String bodyHtml;

    private TriggerEvent triggerEvent;

    private String variablesJson;

    private boolean isActive;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
