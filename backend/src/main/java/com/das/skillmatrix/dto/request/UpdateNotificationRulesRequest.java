package com.das.skillmatrix.dto.request;

import java.util.List;

import com.das.skillmatrix.entity.TriggerEvent;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateNotificationRulesRequest {

    @Valid
    @NotEmpty
    private List<NotificationRuleEntry> rules;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationRuleEntry {

        @NotNull
        private TriggerEvent triggerEvent;

        @NotNull
        private Boolean enabled;

        @Min(1)
        private Integer reminderIntervalDays;
    }
}
