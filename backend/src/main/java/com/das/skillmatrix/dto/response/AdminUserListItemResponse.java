package com.das.skillmatrix.dto.response;

import java.time.LocalDateTime;

import com.das.skillmatrix.entity.GeneralStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserListItemResponse {

    private Long userId;

    private String fullName;

    private String avatarUrl;

    private String email;

    private String positionName;

    private GeneralStatus status;

    private LocalDateTime createdAt;
}
