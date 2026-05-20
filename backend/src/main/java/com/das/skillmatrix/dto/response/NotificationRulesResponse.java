package com.das.skillmatrix.dto.response;

import java.util.List;

import com.das.skillmatrix.entity.TriggerEvent;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRulesResponse {

    private List<RuleEntry> rules;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RuleEntry {

        private TriggerEvent triggerEvent;

        private boolean enabled;

        private Integer reminderIntervalDays;
    }
}
