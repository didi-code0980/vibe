package com.das.skillmatrix.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.das.skillmatrix.constants.NotificationConstants;
import com.das.skillmatrix.dto.response.NotificationResponse;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.dto.response.UnreadCountResponse;
import com.das.skillmatrix.entity.Notification;
import com.das.skillmatrix.entity.User;
import com.das.skillmatrix.exception.ResourceNotFoundException;
import com.das.skillmatrix.repository.NotificationRepository;
import com.das.skillmatrix.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    private static final String EMAIL = "alice@example.com";

    private static final Long USER_ID = 42L;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    @DisplayName("listMyNotifications() returns paged DTOs for current user, no filter")
    void listMyNotifications_returnsPagedDtos_noFilter() {
        User user = this.buildUser();
        Notification n = this.buildNotification(1L, user, false);
        Page<Notification> page = new PageImpl<>(List.of(n), PageRequest.of(0, 20), 1);

        when(this.userRepository.findUserByEmail(EMAIL)).thenReturn(user);
        when(this.notificationRepository.findByRecipient_UserId(eq(USER_ID), any(Pageable.class)))
                .thenReturn(page);

        PageResponse<NotificationResponse> result = this.notificationService
                .listMyNotifications(EMAIL, null, PageRequest.of(0, 20));

        assertEquals(1, result.getItems().size());
        assertEquals(1L, result.getItems().get(0).getId());
        assertEquals(1L, result.getTotalElements());
    }

    @Test
    @DisplayName("listMyNotifications() filters by isRead when provided")
    void listMyNotifications_filtersByIsRead() {
        User user = this.buildUser();
        Page<Notification> page = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);

        when(this.userRepository.findUserByEmail(EMAIL)).thenReturn(user);
        when(this.notificationRepository
                .findByRecipient_UserIdAndIsRead(eq(USER_ID), eq(false), any(Pageable.class)))
                .thenReturn(page);

        PageResponse<NotificationResponse> result = this.notificationService
                .listMyNotifications(EMAIL, false, PageRequest.of(0, 20));

        assertTrue(result.getItems().isEmpty());
        verify(this.notificationRepository, never())
                .findByRecipient_UserId(any(), any());
    }

    @Test
    @DisplayName("listMyNotifications() throws when caller email is unknown")
    void listMyNotifications_throws_whenUserMissing() {
        when(this.userRepository.findUserByEmail("ghost@example.com")).thenReturn(null);

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> this.notificationService.listMyNotifications(
                        "ghost@example.com", null, PageRequest.of(0, 20)));
        assertEquals(NotificationConstants.MSG_RECIPIENT_NOT_FOUND, ex.getMessage());
    }

    @Test
    @DisplayName("countMyUnread() returns repository count")
    void countMyUnread_returnsRepositoryCount() {
        User user = this.buildUser();
        when(this.userRepository.findUserByEmail(EMAIL)).thenReturn(user);
        when(this.notificationRepository.countByRecipient_UserIdAndIsReadFalse(USER_ID))
                .thenReturn(7L);

        UnreadCountResponse result = this.notificationService.countMyUnread(EMAIL);

        assertEquals(7L, result.getCount());
    }

    @Test
    @DisplayName("countMyUnread() returns zero when no unread")
    void countMyUnread_zero() {
        User user = this.buildUser();
        when(this.userRepository.findUserByEmail(EMAIL)).thenReturn(user);
        when(this.notificationRepository.countByRecipient_UserIdAndIsReadFalse(USER_ID))
                .thenReturn(0L);

        assertEquals(0L, this.notificationService.countMyUnread(EMAIL).getCount());
    }

    @Test
    @DisplayName("markOneAsRead() flips flag and returns DTO")
    void markOneAsRead_flipsFlag() {
        User user = this.buildUser();
        Notification n = this.buildNotification(10L, user, false);
        when(this.notificationRepository.findById(10L)).thenReturn(java.util.Optional.of(n));
        when(this.notificationRepository.save(any(Notification.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        NotificationResponse result = this.notificationService.markOneAsRead(EMAIL, 10L);

        assertTrue(result.isRead());
        assertTrue(n.isRead());
    }

    @Test
    @DisplayName("markOneAsRead() is idempotent when already read")
    void markOneAsRead_idempotent() {
        User user = this.buildUser();
        Notification n = this.buildNotification(10L, user, true);
        when(this.notificationRepository.findById(10L)).thenReturn(java.util.Optional.of(n));
        when(this.notificationRepository.save(any(Notification.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        NotificationResponse result = this.notificationService.markOneAsRead(EMAIL, 10L);

        assertTrue(result.isRead());
    }

    @Test
    @DisplayName("markOneAsRead() throws when notification id unknown")
    void markOneAsRead_throwsWhenMissing() {
        when(this.notificationRepository.findById(99L)).thenReturn(java.util.Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> this.notificationService.markOneAsRead(EMAIL, 99L));
    }

    @Test
    @DisplayName("markOneAsRead() rejects non-owner with not-found (defense in depth)")
    void markOneAsRead_rejectsNonOwner() {
        User other = new User();
        other.setUserId(999L);
        other.setEmail("eve@example.com");
        Notification n = this.buildNotification(10L, other, false);
        when(this.notificationRepository.findById(10L)).thenReturn(java.util.Optional.of(n));

        assertThrows(ResourceNotFoundException.class,
                () -> this.notificationService.markOneAsRead(EMAIL, 10L));
        verify(this.notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("markAllAsRead() returns count of updated rows")
    void markAllAsRead_returnsCount() {
        User user = this.buildUser();
        when(this.userRepository.findUserByEmail(EMAIL)).thenReturn(user);
        when(this.notificationRepository.markAllAsReadForUser(USER_ID)).thenReturn(3);

        int count = this.notificationService.markAllAsRead(EMAIL);

        assertEquals(3, count);
    }

    @Test
    @DisplayName("createNotification() persists with isRead=false")
    void createNotification_persistsUnread() {
        User user = this.buildUser();
        when(this.notificationRepository.save(any(Notification.class)))
                .thenAnswer(inv -> {
                    Notification saved = inv.getArgument(0);
                    saved.setNotificationId(123L);
                    return saved;
                });

        Notification result = this.notificationService.createNotification(
                user,
                NotificationConstants.TYPE_DOCUMENT_ASSIGNED,
                "New doc",
                "You have a new upskill document",
                "DOCUMENT", 55L);

        assertEquals(123L, result.getNotificationId());
        assertEquals(NotificationConstants.TYPE_DOCUMENT_ASSIGNED, result.getType());
        assertTrue(!result.isRead());
    }

    private User buildUser() {
        User user = new User();
        user.setUserId(USER_ID);
        user.setEmail(EMAIL);
        return user;
    }

    private Notification buildNotification(Long id, User recipient, boolean read) {
        Notification n = new Notification();
        n.setNotificationId(id);
        n.setRecipient(recipient);
        n.setType(NotificationConstants.TYPE_DOCUMENT_ASSIGNED);
        n.setTitle("Doc assigned");
        n.setBody("body");
        n.setRead(read);
        return n;
    }
}
