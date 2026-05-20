package com.das.skillmatrix.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.das.skillmatrix.entity.GeneralStatus;
import com.das.skillmatrix.entity.Language;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {

    private Long userId;

    private String email;

    private String fullName;

    private String userAvatar;

    private String phone;

    private String role;

    private GeneralStatus status;

    private boolean mustChangePassword;

    private boolean notificationEmail;

    private Language language;

    private List<PositionBrief> positions;

    private Long careerId;

    private String careerName;

    private Long departmentId;

    private String departmentName;

    private Long teamId;

    private String teamName;

    private LocalDateTime createdAt;
}