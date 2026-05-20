package com.das.skillmatrix.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.das.skillmatrix.dto.request.UpdateNotificationRulesRequest;
import com.das.skillmatrix.dto.request.UpdateNotificationRulesRequest.NotificationRuleEntry;
import com.das.skillmatrix.dto.response.NotificationRulesResponse;
import com.das.skillmatrix.entity.NotificationRule;
import com.das.skillmatrix.entity.TriggerEvent;
import com.das.skillmatrix.repository.NotificationRuleRepository;

@ExtendWith(MockitoExtension.class)
class NotificationRuleServiceTest {

    @Mock
    private NotificationRuleRepository notificationRuleRepository;

    @InjectMocks
    private NotificationRuleService notificationRuleService;

    @Test
    @DisplayName("isEnabled() always returns true for critical events")
    void isEnabled_criticalAlwaysTrue() {
        assertTrue(notificationRuleService.isEnabled(TriggerEvent.ACCOUNT_CREATED));
        assertTrue(notificationRuleService.isEnabled(TriggerEvent.PASSWORD_RESET));
        assertTrue(notificationRuleService.isEnabled(TriggerEvent.DOCUMENT_ASSIGNED));
    }

    @Test
    @DisplayName("isEnabled() reads rule for non-critical event")
    void isEnabled_readsRule() {
        NotificationRule rule = new NotificationRule();
        rule.setTriggerEvent(TriggerEvent.GOAL_SUGGESTED);
        rule.setEnabled(false);
        when(notificationRuleRepository.findByTriggerEvent(TriggerEvent.GOAL_SUGGESTED))
                .thenReturn(Optional.of(rule));

        assertEquals(false, notificationRuleService.isEnabled(TriggerEvent.GOAL_SUGGESTED));
    }

    @Test
    @DisplayName("update() persists rule values")
    void update_persistsValues() {
        UpdateNotificationRulesRequest request = new UpdateNotificationRulesRequest(List.of(
                new NotificationRuleEntry(TriggerEvent.LEARNING_REMINDER, true, 3)));

        when(notificationRuleRepository.findByTriggerEvent(TriggerEvent.LEARNING_REMINDER))
                .thenReturn(Optional.empty());
        when(notificationRuleRepository.save(any(NotificationRule.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(notificationRuleRepository.findAllByOrderByTriggerEventAsc())
                .thenReturn(List.of(buildRule(TriggerEvent.LEARNING_REMINDER, true, 3)));

        NotificationRulesResponse response = notificationRuleService.update(request);

        assertEquals(1, response.getRules().size());
        assertEquals(true, response.getRules().get(0).isEnabled());
        assertEquals(3, response.getRules().get(0).getReminderIntervalDays());
    }

    private NotificationRule buildRule(TriggerEvent event, boolean enabled, Integer interval) {
        NotificationRule r = new NotificationRule();
        r.setTriggerEvent(event);
        r.setEnabled(enabled);
        r.setReminderIntervalDays(interval);
        return r;
    }
}
