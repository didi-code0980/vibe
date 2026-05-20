package com.das.skillmatrix.dto.request;

import com.das.skillmatrix.constants.ConfigConstants;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequiredSkillEntry {

    @NotNull(message = ConfigConstants.MSG_SKILL_REF_INVALID)
    private Long skillId;

    @NotNull(message = ConfigConstants.MSG_MIN_LEVEL_INVALID)
    @Min(value = 1, message = ConfigConstants.MSG_MIN_LEVEL_INVALID)
    @Max(value = 5, message = ConfigConstants.MSG_MIN_LEVEL_INVALID)
    private Integer minLevel;
}
