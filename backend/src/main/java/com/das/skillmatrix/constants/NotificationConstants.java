package com.das.skillmatrix.constants;

import java.util.List;

public final class NotificationConstants {

    private NotificationConstants() {
    }

    // ===== In-app notification type keys =====
    public static final String TYPE_ACCOUNT_CREATED = "ACCOUNT_CREATED";

    public static final String TYPE_PASSWORD_RESET = "PASSWORD_RESET";

    public static final String TYPE_DOCUMENT_ASSIGNED = "DOCUMENT_ASSIGNED";

    public static final String TYPE_LEARNING_REMINDER = "LEARNING_REMINDER";

    public static final String TYPE_GOAL_SUGGESTED = "GOAL_SUGGESTED";

    public static final String TYPE_ASSESSMENT_REVIEWED = "ASSESSMENT_REVIEWED";

    public static final List<String> SUPPORTED_TYPES = List.of(
            TYPE_ACCOUNT_CREATED,
            TYPE_PASSWORD_RESET,
            TYPE_DOCUMENT_ASSIGNED,
            TYPE_LEARNING_REMINDER,
            TYPE_GOAL_SUGGESTED,
            TYPE_ASSESSMENT_REVIEWED);

    // ===== Error messages =====
    public static final String MSG_NOTIFICATION_NOT_FOUND = "Notification not found.";

    public static final String MSG_RECIPIENT_NOT_FOUND = "Recipient user not found.";
}
