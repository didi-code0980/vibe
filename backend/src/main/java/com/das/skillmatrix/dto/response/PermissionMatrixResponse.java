package com.das.skillmatrix.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionMatrixResponse {

    private List<String> roles;

    private List<String> featureKeys;

    private List<Entry> flags;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Entry {

        private String role;

        private String featureKey;

        private boolean enabled;
    }
}
