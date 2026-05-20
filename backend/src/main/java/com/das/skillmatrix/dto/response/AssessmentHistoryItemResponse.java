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
public class AssessmentHistoryItemResponse {

    private Long evaluationId;

    private Long skillId;

    private String skillName;

    private String departmentName;

    private Integer selfScore;

    private Integer managerScore;

    private LocalDateTime assessedAt;
}