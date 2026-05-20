package com.das.skillmatrix.dto.request;

import java.util.ArrayList;
import java.util.List;

import com.das.skillmatrix.constants.ConfigConstants;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PositionCreateRequest {

    @NotBlank(message = ConfigConstants.MSG_POSITION_NAME_REQUIRED)
    @Size(max = 150)
    private String name;

    @Size(max = 1000)
    private String description;

    @Valid
    private List<RequiredSkillEntry> requiredSkills = new ArrayList<>();
}
