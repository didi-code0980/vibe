package com.das.skillmatrix.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    String storeAvatar(Long userId, MultipartFile file);

    void deleteAvatar(String avatarUrl);
}