package com.das.skillmatrix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmtpConfigResponse {

    private String host;

    private int port;

    private String username;

    private boolean passwordSet;

    private String fromEmail;

    private String fromName;

    private boolean useTls;
}
