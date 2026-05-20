package com.das.skillmatrix.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.das.skillmatrix.constants.NotificationConstants;
import com.das.skillmatrix.dto.response.NotificationResponse;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.dto.response.UnreadCountResponse;
import com.das.skillmatrix.entity.Notification;
import com.das.skillmatrix.entity.User;
import com.das.skillmatrix.exception.ResourceNotFoundException;
import com.das.skillmatrix.repository.NotificationRepository;
import com.das.skillmatrix.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> listMyNotifications(
            String email, Boolean isRead, Pageable pageable) {
        User recipient = this.findRecipientByEmail(email);
        Page<Notification> page = this.fetchOwnNotifications(recipient.getUserId(), isRead, pageable);
        return this.toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse countMyUnread(String email) {
        User recipient = this.findRecipientByEmail(email);
        long count = this.notificationRepository
                .countByRecipient_UserIdAndIsReadFalse(recipient.getUserId());
        return new UnreadCountResponse(count);
    }

    public NotificationResponse markOneAsRead(String email, Long notificationId) {
        Notification notification = this.findNotificationById(notificationId);
        this.assertOwnership(notification, email);
        notification.markAsRead();
        Notification persisted = this.notificationRepository.save(notification);
        return NotificationResponse.from(persisted);
    }

    public int markAllAsRead(String email) {
        User recipient = this.findRecipientByEmail(email);
        return this.notificationRepository.markAllAsReadForUser(recipient.getUserId());
    }

    public Notification createNotification(
            User recipient, String type, String title, String body,
            String relatedEntityType, Long relatedEntityId) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setRelatedEntityType(relatedEntityType);
        notification.setRelatedEntityId(relatedEntityId);
        notification.setRead(false);
        return this.notificationRepository.save(notification);
    }

    private Page<Notification> fetchOwnNotifications(Long userId, Boolean isRead, Pageable pageable) {
        if (isRead == null) {
            return this.notificationRepository.findByRecipient_UserId(userId, pageable);
        }
        return this.notificationRepository.findByRecipient_UserIdAndIsRead(userId, isRead, pageable);
    }

    private User findRecipientByEmail(String email) {
        User user = this.userRepository.findUserByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException(NotificationConstants.MSG_RECIPIENT_NOT_FOUND);
        }
        return user;
    }

    private Notification findNotificationById(Long id) {
        return this.notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        NotificationConstants.MSG_NOTIFICATION_NOT_FOUND));
    }

    private void assertOwnership(Notification notification, String email) {
        if (!notification.isOwnedBy(email)) {
            throw new ResourceNotFoundException(NotificationConstants.MSG_NOTIFICATION_NOT_FOUND);
        }
    }

    private PageResponse<NotificationResponse> toPageResponse(Page<Notification> page) {
        List<NotificationResponse> items = page.getContent().stream()
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
        return new PageResponse<>(
                items,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext(),
                page.hasPrevious());
    }
}
