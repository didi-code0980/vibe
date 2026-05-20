package com.das.skillmatrix.dto.request;

import com.das.skillmatrix.entity.TriggerEvent;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailTemplateRequest {

    @NotBlank
    @Size(max = 150)
    private String name;

    @NotBlank
    @Size(max = 500)
    private String subject;

    @NotBlank
    private String bodyHtml;

    @NotNull
    private TriggerEvent triggerEvent;

    private String variablesJson;

    @NotNull
    private Boolean isActive;
}
