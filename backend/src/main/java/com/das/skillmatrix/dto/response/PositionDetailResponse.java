package com.das.skillmatrix.dto.response;

import java.util.List;

import com.das.skillmatrix.entity.GeneralStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionDetailResponse {

    private Long positionId;

    private String name;

    private String description;

    private GeneralStatus status;

    private List<RequiredSkillResponse> requiredSkills;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RequiredSkillResponse {

        private Long skillId;

        private String skillName;

        private Integer minLevel;
    }
}
