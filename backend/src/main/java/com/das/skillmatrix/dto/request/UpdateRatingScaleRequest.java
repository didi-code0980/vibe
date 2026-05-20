package com.das.skillmatrix.dto.request;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRatingScaleRequest {

    @Valid
    @NotEmpty
    @Size(min = 5, max = 5)
    private List<RatingScaleEntry> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RatingScaleEntry {

        @NotNull
        @Min(1)
        @Max(5)
        private Integer level;

        @NotBlank
        @Size(max = 100)
        private String label;

        @Size(max = 1000)
        private String description;
    }
}
