package com.das.skillmatrix.constants;

import java.util.List;
import java.util.Set;

public final class ProfileConstants {

    private ProfileConstants() {
    }

    public static final long MAX_AVATAR_SIZE_BYTES = 2L * 1024L * 1024L;

    public static final Set<String> AVATAR_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    public static final List<String> AVATAR_EXTENSIONS = List.of(
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
    );

    public static final String EVALUATION_TYPE_SELF = "SELF";

    public static final String EVALUATION_TYPE_MANAGER = "MANAGER";

    public static final String MSG_PROFILE_NOT_FOUND = "PROFILE_NOT_FOUND";

    public static final String MSG_AVATAR_EMPTY = "AVATAR_FILE_EMPTY";

    public static final String MSG_AVATAR_TOO_LARGE = "AVATAR_FILE_TOO_LARGE";

    public static final String MSG_AVATAR_INVALID_TYPE = "AVATAR_INVALID_FILE_TYPE";

    public static final String MSG_TEAM_NOT_FOUND = "TEAM_NOT_FOUND";

    public static final String MSG_FULL_NAME_REQUIRED = "FULL_NAME_REQUIRED";

    public static final String MSG_INVALID_PHONE = "INVALID_PHONE_NUMBER";

    public static final String PHONE_REGEX = "^[+]?[0-9\\-\\s]{7,20}$";
}