package com.das.skillmatrix.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import com.das.skillmatrix.constants.ProfileConstants;

class LocalFileStorageServiceTest {

    private LocalFileStorageService storageService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        storageService = new LocalFileStorageService();
        ReflectionTestUtils.setField(storageService, "avatarBasePath", tempDir.toString());
        ReflectionTestUtils.setField(storageService, "avatarPublicBaseUrl", "/static/avatars");
        storageService.init();
    }

    @Test
    @DisplayName("storeAvatar() persists a valid PNG and returns a public URL")
    void storeAvatar_persistsValidPng() throws IOException {
        MultipartFile file = new MockMultipartFile(
                "file", "me.png", "image/png", new byte[]{1, 2, 3, 4});

        String url = storageService.storeAvatar(42L, file);

        assertTrue(url.startsWith("/static/avatars/user-42-"));
        assertTrue(url.endsWith(".png"));
        long count = Files.list(tempDir).count();
        assertEquals(1, count);
    }

    @Test
    @DisplayName("storeAvatar() rejects empty files")
    void storeAvatar_rejectsEmpty() {
        MultipartFile file = new MockMultipartFile("file", "me.png", "image/png", new byte[0]);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> storageService.storeAvatar(1L, file));
        assertEquals(ProfileConstants.MSG_AVATAR_EMPTY, ex.getMessage());
    }

    @Test
    @DisplayName("storeAvatar() rejects oversized files")
    void storeAvatar_rejectsOversize() {
        byte[] large = new byte[(int) ProfileConstants.MAX_AVATAR_SIZE_BYTES + 1];
        MultipartFile file = new MockMultipartFile("file", "me.png", "image/png", large);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> storageService.storeAvatar(1L, file));
        assertEquals(ProfileConstants.MSG_AVATAR_TOO_LARGE, ex.getMessage());
    }

    @Test
    @DisplayName("storeAvatar() rejects unsupported content types")
    void storeAvatar_rejectsBadContentType() {
        MultipartFile file = new MockMultipartFile(
                "file", "me.gif", "image/gif", new byte[]{1, 2, 3});

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> storageService.storeAvatar(1L, file));
        assertEquals(ProfileConstants.MSG_AVATAR_INVALID_TYPE, ex.getMessage());
    }

    @Test
    @DisplayName("deleteAvatar() removes the file when URL is valid")
    void deleteAvatar_removesFile() throws IOException {
        MultipartFile file = new MockMultipartFile(
                "file", "me.png", "image/png", new byte[]{9, 9, 9});
        String url = storageService.storeAvatar(5L, file);

        storageService.deleteAvatar(url);

        long count = Files.list(tempDir).count();
        assertEquals(0, count);
    }

    @Test
    @DisplayName("deleteAvatar() ignores blank URLs")
    void deleteAvatar_ignoresBlankUrl() {
        storageService.deleteAvatar(null);
        storageService.deleteAvatar("");
        assertFalse(Files.exists(tempDir.resolve("nonexistent")));
    }

    @Test
    @DisplayName("deleteAvatar() ignores URLs outside the avatar base URL")
    void deleteAvatar_ignoresForeignUrl() {
        storageService.deleteAvatar("https://example.com/elsewhere/photo.png");
    }
}