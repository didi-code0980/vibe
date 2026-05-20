package com.das.skillmatrix.dto.request;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePermissionsRequest {

    @Valid
    @NotEmpty
    private List<PermissionFlagEntry> flags;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PermissionFlagEntry {

        @NotNull
        private String role;

        @NotNull
        private String featureKey;

        @NotNull
        private Boolean enabled;
    }
}
