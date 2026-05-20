package com.das.skillmatrix.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.das.skillmatrix.constants.ProfileConstants;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class LocalFileStorageService implements FileStorageService {

    @Value("${app.storage.avatar-base-path:uploads/avatars}")
    private String avatarBasePath;

    @Value("${app.storage.avatar-public-base-url:/static/avatars}")
    private String avatarPublicBaseUrl;

    private Path avatarBaseDir;

    @PostConstruct
    public void init() {
        try {
            this.avatarBaseDir = Paths.get(this.avatarBasePath).toAbsolutePath().normalize();
            Files.createDirectories(this.avatarBaseDir);
            log.info("Avatar storage initialized at {}", this.avatarBaseDir);
        } catch (IOException e) {
            throw new IllegalStateException("Could not initialize avatar storage", e);
        }
    }

    @Override
    public String storeAvatar(Long userId, MultipartFile file) {
        this.validateAvatarFile(file);
        String extension = this.extractExtension(file.getOriginalFilename());
        String fileName = this.buildAvatarFileName(userId, extension);
        Path targetPath = this.avatarBaseDir.resolve(fileName).normalize();
        if (!targetPath.startsWith(this.avatarBaseDir)) {
            throw new IllegalArgumentException(ProfileConstants.MSG_AVATAR_INVALID_TYPE);
        }
        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Could not store avatar file", e);
        }
        return this.avatarPublicBaseUrl + "/" + fileName;
    }

    @Override
    public void deleteAvatar(String avatarUrl) {
        if (!StringUtils.hasText(avatarUrl)) {
            return;
        }
        if (!avatarUrl.startsWith(this.avatarPublicBaseUrl)) {
            return;
        }
        String fileName = avatarUrl.substring(this.avatarPublicBaseUrl.length()).replaceAll("^/+", "");
        Path target = this.avatarBaseDir.resolve(fileName).normalize();
        if (!target.startsWith(this.avatarBaseDir)) {
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            log.warn("Failed to delete old avatar {}: {}", target, e.getMessage());
        }
    }

    private void validateAvatarFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(ProfileConstants.MSG_AVATAR_EMPTY);
        }
        if (file.getSize() > ProfileConstants.MAX_AVATAR_SIZE_BYTES) {
            throw new IllegalArgumentException(ProfileConstants.MSG_AVATAR_TOO_LARGE);
        }
        String contentType = file.getContentType();
        if (contentType == null || !ProfileConstants.AVATAR_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(ProfileConstants.MSG_AVATAR_INVALID_TYPE);
        }
    }

    private String extractExtension(String originalFilename) {
        if (!StringUtils.hasText(originalFilename)) {
            return ".png";
        }
        int dot = originalFilename.lastIndexOf('.');
        if (dot < 0) {
            return ".png";
        }
        String ext = originalFilename.substring(dot).toLowerCase();
        if (!ProfileConstants.AVATAR_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException(ProfileConstants.MSG_AVATAR_INVALID_TYPE);
        }
        return ext;
    }

    private String buildAvatarFileName(Long userId, String extension) {
        return "user-" + userId + "-" + UUID.randomUUID() + extension;
    }
}
