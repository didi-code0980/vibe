package com.das.skillmatrix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notification_rules")
@Getter
@Setter
@NoArgsConstructor
public class NotificationRule extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger_event", nullable = false, unique = true, length = 64)
    private TriggerEvent triggerEvent;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "reminder_interval_days")
    private Integer reminderIntervalDays;
}
