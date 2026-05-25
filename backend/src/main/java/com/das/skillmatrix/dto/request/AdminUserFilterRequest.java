package com.das.skillmatrix.dto.request;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import com.das.skillmatrix.entity.GeneralStatus;

import lombok.Data;

@Data
public class AdminUserFilterRequest {

    private String search;

    private GeneralStatus status;

    private Long positionId;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate createdFrom;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate createdTo;

    private String sortBy;

    private String sortDir;
}
