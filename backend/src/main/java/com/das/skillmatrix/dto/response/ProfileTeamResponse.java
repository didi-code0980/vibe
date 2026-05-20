package com.das.skillmatrix.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileTeamResponse {

    private Long teamId;

    private String teamName;

    private String managerFullName;

    private List<TeammateBrief> teammates;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeammateBrief {

        private Long userId;

        private String fullName;

        private String userAvatar;

        private List<PublicSkillScore> skills;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PublicSkillScore {

        private Long skillId;

        private String skillName;

        private Integer selfScore;
    }
}