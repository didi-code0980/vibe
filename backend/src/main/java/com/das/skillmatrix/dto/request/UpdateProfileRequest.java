package com.das.skillmatrix.dto.request;

import com.das.skillmatrix.constants.ProfileConstants;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @NotBlank(message = ProfileConstants.MSG_FULL_NAME_REQUIRED)
    @Size(max = 150)
    private String fullName;

    @Pattern(
            regexp = ProfileConstants.PHONE_REGEX,
            message = ProfileConstants.MSG_INVALID_PHONE
    )
    private String phone;
}