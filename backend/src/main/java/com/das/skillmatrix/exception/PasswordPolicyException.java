package com.das.skillmatrix.exception;

import java.util.List;

public class PasswordPolicyException extends RuntimeException {

    private final List<String> violations;

    public PasswordPolicyException(List<String> violations) {
        super("Password policy violation");
        this.violations = violations;
    }

    public List<String> getViolations() {
        return violations;
    }
}
