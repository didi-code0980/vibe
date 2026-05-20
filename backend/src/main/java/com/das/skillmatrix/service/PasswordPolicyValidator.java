package com.das.skillmatrix.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.das.skillmatrix.exception.PasswordPolicyException;

@Component
public class PasswordPolicyValidator {

    public void validate(String password) {
        List<String> violations = new ArrayList<>();
        if (password == null || password.length() < 8) {
            violations.add("Must be at least 8 characters");
        }
        if (password == null || password.chars().noneMatch(Character::isUpperCase)) {
            violations.add("Must contain at least 1 uppercase letter");
        }
        if (password == null || password.chars().noneMatch(Character::isDigit)) {
            violations.add("Must contain at least 1 digit");
        }
        if (!violations.isEmpty()) {
            throw new PasswordPolicyException(violations);
        }
    }
}
