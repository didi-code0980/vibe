package com.das.skillmatrix.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.das.skillmatrix.constants.ConfigConstants;
import com.das.skillmatrix.dto.request.UpdateNotificationRulesRequest;
import com.das.skillmatrix.dto.request.UpdateNotificationRulesRequest.NotificationRuleEntry;
import com.das.skillmatrix.dto.response.NotificationRulesResponse;
import com.das.skillmatrix.dto.response.NotificationRulesResponse.RuleEntry;
import com.das.skillmatrix.entity.NotificationRule;
import com.das.skillmatrix.entity.TriggerEvent;
import com.das.skillmatrix.repository.NotificationRuleRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class NotificationRuleService {

    private final NotificationRuleRepository notificationRuleRepository;

    @Transactional(readOnly = true)
    public NotificationRulesResponse getAll() {
        this.ensureRulesSeeded();
        List<NotificationRule> rules = this.notificationRuleRepository.findAllByOrderByTriggerEventAsc();
        return this.toResponse(rules);
    }

    public NotificationRulesResponse update(UpdateNotificationRulesRequest request) {
        if (request.getRules() == null || request.getRules().isEmpty()) {
            throw new IllegalArgumentException(ConfigConstants.MSG_NOTIFICATION_RULE_NOT_FOUND);
        }
        for (NotificationRuleEntry entry : request.getRules()) {
            NotificationRule rule = this.notificationRuleRepository.findByTriggerEvent(entry.getTriggerEvent())
                    .orElseGet(() -> this.createRule(entry.getTriggerEvent()));
            rule.setEnabled(Boolean.TRUE.equals(entry.getEnabled()));
            rule.setReminderIntervalDays(entry.getReminderIntervalDays());
            this.notificationRuleRepository.save(rule);
        }
        return this.getAll();
    }

    @Transactional(readOnly = true)
    public boolean isEnabled(TriggerEvent triggerEvent) {
        if (ConfigConstants.CRITICAL_EVENTS.contains(triggerEvent.name())) {
            return true;
        }
        return this.notificationRuleRepository.findByTriggerEvent(triggerEvent)
                .map(NotificationRule::isEnabled)
                .orElse(true);
    }

    private void ensureRulesSeeded() {
        for (TriggerEvent event : TriggerEvent.values()) {
            if (this.notificationRuleRepository.findByTriggerEvent(event).isEmpty()) {
                this.createRule(event);
            }
        }
    }

    private NotificationRule createRule(TriggerEvent event) {
        NotificationRule rule = new NotificationRule();
        rule.setTriggerEvent(event);
        rule.setEnabled(true);
        rule.setReminderIntervalDays(null);
        return this.notificationRuleRepository.save(rule);
    }

    private NotificationRulesResponse toResponse(List<NotificationRule> rules) {
        List<RuleEntry> entries = rules.stream()
                .map(r -> RuleEntry.builder()
                        .triggerEvent(r.getTriggerEvent())
                        .enabled(r.isEnabled())
                        .reminderIntervalDays(r.getReminderIntervalDays())
                        .build())
                .collect(Collectors.toList());
        return NotificationRulesResponse.builder().rules(entries).build();
    }
}
