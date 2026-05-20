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
public class RatingScaleResponse {

    private List<RatingScaleItem> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RatingScaleItem {

        private Integer level;

        private String label;

        private String description;
    }
}
