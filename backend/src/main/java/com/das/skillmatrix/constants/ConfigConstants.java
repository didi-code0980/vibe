package com.das.skillmatrix.constants;

import java.util.List;
import java.util.Map;

public final class ConfigConstants {

    private ConfigConstants() {
    }

    // ===== Role catalogue (read-only in v1) =====
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_MANAGER_CAREER = "MANAGER_CAREER";
    public static final String ROLE_MANAGER_DEPARTMENT = "MANAGER_DEPARTMENT";
    public static final String ROLE_MANAGER_TEAM = "MANAGER_TEAM";
    public static final String ROLE_STAFF = "STAFF";

    public static final List<String> ROLES = List.of(
            ROLE_ADMIN,
            ROLE_MANAGER_CAREER,
            ROLE_MANAGER_DEPARTMENT,
            ROLE_MANAGER_TEAM,
            ROLE_STAFF);

    // ===== Permission feature keys =====
    public static final String FEATURE_CROSS_TEAM_RESOURCE_MATCH = "CROSS_TEAM_RESOURCE_MATCH";
    public static final String FEATURE_VIEW_AUDIT_LOGS = "VIEW_AUDIT_LOGS";
    public static final String FEATURE_EXPORT_REPORTS = "EXPORT_REPORTS";

    public static final List<String> FEATURE_KEYS = List.of(
            FEATURE_CROSS_TEAM_RESOURCE_MATCH,
            FEATURE_VIEW_AUDIT_LOGS,
            FEATURE_EXPORT_REPORTS);

    // ===== Rating scale =====
    public static final int RATING_LEVEL_MIN = 1;
    public static final int RATING_LEVEL_MAX = 5;

    public static final Map<Integer, String> DEFAULT_RATING_LABELS = Map.of(
            1, "Beginner",
            2, "Basic",
            3, "Intermediate",
            4, "Advanced",
            5, "Expert");

    // ===== Trigger events =====
    public static final String EVENT_ACCOUNT_CREATED = "ACCOUNT_CREATED";
    public static final String EVENT_PASSWORD_RESET = "PASSWORD_RESET";
    public static final String EVENT_DOCUMENT_ASSIGNED = "DOCUMENT_ASSIGNED";
    public static final String EVENT_LEARNING_REMINDER = "LEARNING_REMINDER";
    public static final String EVENT_GOAL_SUGGESTED = "GOAL_SUGGESTED";
    public static final String EVENT_ASSESSMENT_REVIEWED = "ASSESSMENT_REVIEWED";

    // Critical emails always send regardless of rule state (SYSTEM.md §23.11)
    public static final List<String> CRITICAL_EVENTS = List.of(
            EVENT_ACCOUNT_CREATED,
            EVENT_PASSWORD_RESET,
            EVENT_DOCUMENT_ASSIGNED);

    // ===== Error codes =====
    public static final String MSG_POSITION_NOT_FOUND = "POSITION_NOT_FOUND";
    public static final String MSG_POSITION_NAME_EXISTS = "POSITION_NAME_EXISTS";
    public static final String MSG_POSITION_NAME_REQUIRED = "POSITION_NAME_REQUIRED";
    public static final String MSG_SKILL_REF_INVALID = "SKILL_REF_INVALID";
    public static final String MSG_MIN_LEVEL_INVALID = "MIN_LEVEL_INVALID";

    public static final String MSG_RATING_INVALID_LEVELS = "RATING_INVALID_LEVELS";
    public static final String MSG_RATING_DUPLICATE_LEVEL = "RATING_DUPLICATE_LEVEL";
    public static final String MSG_RATING_LABEL_REQUIRED = "RATING_LABEL_REQUIRED";

    public static final String MSG_SMTP_NOT_CONFIGURED = "SMTP_NOT_CONFIGURED";
    public static final String MSG_SMTP_TEST_FAILED = "SMTP_TEST_FAILED";

    public static final String MSG_EMAIL_TEMPLATE_NOT_FOUND = "EMAIL_TEMPLATE_NOT_FOUND";
    public static final String MSG_TRIGGER_EVENT_INVALID = "TRIGGER_EVENT_INVALID";
    public static final String MSG_TEMPLATE_NAME_EXISTS = "TEMPLATE_NAME_EXISTS";

    public static final String MSG_NOTIFICATION_RULE_NOT_FOUND = "NOTIFICATION_RULE_NOT_FOUND";
    public static final String MSG_INVALID_FEATURE_KEY = "INVALID_FEATURE_KEY";
    public static final String MSG_INVALID_ROLE = "INVALID_ROLE";

    public static final String ENTITY_POSITION = "POSITION";
    public static final String ENTITY_RATING_SCALE = "RATING_SCALE";
    public static final String ENTITY_SMTP_CONFIG = "SMTP_CONFIG";
    public static final String ENTITY_EMAIL_TEMPLATE = "EMAIL_TEMPLATE";
    public static final String ENTITY_NOTIFICATION_RULE = "NOTIFICATION_RULE";
    public static final String ENTITY_PERMISSION = "PERMISSION";
}
