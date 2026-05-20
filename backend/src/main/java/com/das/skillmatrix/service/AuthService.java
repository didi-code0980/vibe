package com.das.skillmatrix.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.das.skillmatrix.dto.request.ChangePasswordRequest;
import com.das.skillmatrix.dto.request.ForgotPasswordRequest;
import com.das.skillmatrix.dto.request.LoginRequest;
import com.das.skillmatrix.dto.request.RefreshTokenRequest;
import com.das.skillmatrix.dto.request.ResetPasswordRequest;
import com.das.skillmatrix.dto.response.LoginResponse;
import com.das.skillmatrix.dto.response.RefreshTokenResponse;
import com.das.skillmatrix.entity.GeneralStatus;
import com.das.skillmatrix.entity.PasswordResetToken;
import com.das.skillmatrix.entity.RefreshToken;
import com.das.skillmatrix.entity.User;
import com.das.skillmatrix.exception.AccountLockedException;
import com.das.skillmatrix.repository.PasswordResetTokenRepository;
import com.das.skillmatrix.repository.RefreshTokenRepository;
import com.das.skillmatrix.repository.UserRepository;
import com.das.skillmatrix.security.JwtUtil;

import jakarta.security.auth.message.AuthException;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Slf4j
public class AuthService {

    @Value("${jwt.refresh.expiration}")
    private long refreshExpiration;

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final PasswordPolicyValidator passwordPolicyValidator;
    private final AuditService auditService;

    public AuthService(PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            JwtUtil jwtUtil,
            EmailService emailService,
            PasswordPolicyValidator passwordPolicyValidator,
            AuditService auditService) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
        this.passwordPolicyValidator = passwordPolicyValidator;
        this.auditService = auditService;
    }

    public LoginResponse login(LoginRequest loginRequest) throws AuthException {
        User user = userRepository.findUserByEmail(loginRequest.getEmail());

        if (user == null || user.getStatus() == GeneralStatus.DELETED) {
            auditService.log(null, "LOGIN_FAILURE", "USER", null, null,
                    "email=" + loginRequest.getEmail());
            throw new AuthException("ACCOUNT_NOT_FOUND");
        }

        if (user.getStatus() == GeneralStatus.DEACTIVE) {
            auditService.log(user.getUserId(), "LOGIN_FAILURE", "USER", user.getUserId(), null,
                    "Account locked");
            throw new AccountLockedException("Account is locked. Contact administrator.");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            auditService.log(user.getUserId(), "LOGIN_FAILURE", "USER", user.getUserId(), null,
                    "Wrong password");
            throw new AuthException("WRONG_PASSWORD");
        }

        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        RefreshToken refreshTokenEntity = new RefreshToken();
        refreshTokenEntity.setUser(user);
        refreshTokenEntity.setRefreshToken(refreshToken);
        refreshTokenEntity.setExpiresAt(LocalDateTime.now().plusSeconds(refreshExpiration / 1000));
        refreshTokenRepository.save(refreshTokenEntity);

        auditService.log(user.getUserId(), "LOGIN_SUCCESS", "USER", user.getUserId(), null, null);

        return new LoginResponse(accessToken, refreshToken, user.isMustChangePassword());
    }

    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) throws AuthException {
        String refreshToken = request.getRefreshToken();

        if (!jwtUtil.validateRefreshToken(refreshToken)) {
            throw new AuthException("Invalid or expired refresh token");
        }

        String emailUser = jwtUtil.extractEmail(refreshToken);
        User user = findActiveUserByEmail(emailUser);
        String newAccessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRole());

        return new RefreshTokenResponse(newAccessToken);
    }

    public String logout(String email) throws AuthException {
        User user = findActiveUserByEmail(email);
        refreshTokenRepository.deleteByUser(user);
        return "Logout Success";
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail();
        User user = userRepository.findUserByEmail(email);

        // Always return 200 — never reveal if email exists
        if (user == null || user.getStatus() != GeneralStatus.ACTIVE) {
            return;
        }

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(token);
        resetToken.setExpiresAt(LocalDateTime.now().plusHours(1));
        passwordResetTokenRepository.save(resetToken);

        log.info("PASSWORD_RESET email to {}: resetLink = /reset-password?token={}", email, token);
        emailService.send(email, "Reset your password",
                "Click here to reset your password: /reset-password?token=" + token);

        auditService.log(user.getUserId(), "PASSWORD_RESET_REQUESTED", "USER", user.getUserId(), null,
                "email=" + email);
    }

    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenAndUsedFalseAndExpiresAtAfter(request.getToken(), LocalDateTime.now())
                .orElseThrow(() -> new IllegalArgumentException("INVALID_OR_EXPIRED_TOKEN"));

        passwordPolicyValidator.validate(request.getNewPassword());

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        auditService.log(user.getUserId(), "PASSWORD_RESET_COMPLETED", "USER", user.getUserId(), null, null);
    }

    public void changePassword(String email, ChangePasswordRequest request) throws AuthException {
        User user = findActiveUserByEmail(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new AuthException("WRONG_CURRENT_PASSWORD");
        }

        passwordPolicyValidator.validate(request.getNewPassword());

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);
    }

    private User findActiveUserByEmail(String email) throws AuthException {
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            throw new AuthException("ACCOUNT_NOT_FOUND");
        }
        return user;
    }
}
