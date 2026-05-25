package com.das.skillmatrix.dto.request;

import com.das.skillmatrix.constants.UsmConstants;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateUserStatusRequest {

    @NotBlank(message = UsmConstants.MSG_INVALID_STATUS_TRANSITION)
    @Pattern(regexp = "ACTIVE|LOCKED", message = UsmConstants.MSG_INVALID_STATUS_TRANSITION)
    private String status;
}
