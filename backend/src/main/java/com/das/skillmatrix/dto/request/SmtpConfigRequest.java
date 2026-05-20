package com.das.skillmatrix.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmtpConfigRequest {

    @NotBlank
    @Size(max = 255)
    private String host;

    @NotNull
    @Min(1)
    @Max(65535)
    private Integer port;

    @Size(max = 255)
    private String username;

    // Write-only — never echoed back in responses
    @Size(max = 512)
    private String password;

    @NotBlank
    @Email
    private String fromEmail;

    @Size(max = 255)
    private String fromName;

    @NotNull
    private Boolean useTls;
}
