package com.das.skillmatrix.dto.request;

import com.das.skillmatrix.entity.Language;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileSettingsRequest {

    @NotNull
    private Boolean notificationEmail;

    @NotNull
    private Language language;
}