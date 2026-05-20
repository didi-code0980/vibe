package com.das.skillmatrix.dto.response;

import com.das.skillmatrix.entity.Language;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileSettingsResponse {

    private boolean notificationEmail;

    private Language language;
}