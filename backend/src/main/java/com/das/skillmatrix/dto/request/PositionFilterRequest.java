package com.das.skillmatrix.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PositionFilterRequest {

    private String keyword;

    private String status;
}
