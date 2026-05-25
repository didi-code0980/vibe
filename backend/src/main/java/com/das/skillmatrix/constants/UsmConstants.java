package com.das.skillmatrix.constants;

import java.util.List;

public final class UsmConstants {

    private UsmConstants() {
    }

    // ===== Audit actions =====
    public static final String ACTION_USER_CREATED = "USER_CREATED";
    public static final String ACTION_USER_LOCKED = "USER_LOCKED";
    public static final String ACTION_USER_UNLOCKED = "USER_UNLOCKED";
    public static final String ACTION_USER_DELETED = "USER_DELETED";

    public static final String ENTITY_USER = "USER";

    // ===== Status transition values accepted by USM-03 =====
    public static final String STATUS_LOCKED = "LOCKED";
    public static final String STATUS_ACTIVE = "ACTIVE";

    public static final List<String> LOCK_UNLOCK_STATUSES = List.of(STATUS_LOCKED, STATUS_ACTIVE);

    // ===== Error codes (USM domain) =====
    public static final String MSG_USER_NOT_FOUND = "USER_NOT_FOUND";
    public static final String MSG_EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS";
    public static final String MSG_FULL_NAME_REQUIRED = "FULL_NAME_REQUIRED";
    public static final String MSG_CANNOT_LOCK_SELF = "CANNOT_LOCK_SELF";
    public static final String MSG_CANNOT_DELETE_SELF = "CANNOT_DELETE_SELF";
    public static final String MSG_INVALID_STATUS_TRANSITION = "INVALID_STATUS_TRANSITION";
    public static final String MSG_INVALID_SORT_FIELD = "INVALID_SORT_FIELD";

    // ===== Sort fields accepted by USM-01 list =====
    public static final String SORT_CREATED_AT = "created_at";
    public static final String SORT_FULL_NAME = "full_name";

    public static final List<String> ALLOWED_SORT_FIELDS = List.of(SORT_CREATED_AT, SORT_FULL_NAME);

    public static final String SORT_DIR_ASC = "asc";
    public static final String SORT_DIR_DESC = "desc";

    // ===== Pagination limits =====
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;

    // ===== Generated password character pools (USM-05) =====
    public static final String PWD_POOL_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    public static final String PWD_POOL_LOWER = "abcdefghijklmnopqrstuvwxyz";
    public static final String PWD_POOL_DIGITS = "0123456789";
    public static final String PWD_POOL_SPECIAL = "!@#$%^&*";
    public static final int GENERATED_PASSWORD_LENGTH = 12;

    // ===== Email template variables (USM-05) =====
    public static final String EMAIL_VAR_FULL_NAME = "full_name";
    public static final String EMAIL_VAR_EMAIL = "email";
    public static final String EMAIL_VAR_TEMP_PASSWORD = "temp_password";
}
