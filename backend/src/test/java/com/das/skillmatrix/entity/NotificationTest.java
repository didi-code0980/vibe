package com.das.skillmatrix.entity;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class NotificationTest {

    @Test
    @DisplayName("markAsRead() flips isRead to true")
    void markAsRead_flipsFlagToTrue() {
        Notification notification = new Notification();
        notification.setRead(false);

        notification.markAsRead();

        assertTrue(notification.isRead());
    }

    @Test
    @DisplayName("markAsRead() is idempotent when already read")
    void markAsRead_isIdempotent() {
        Notification notification = new Notification();
        notification.setRead(true);

        notification.markAsRead();

        assertTrue(notification.isRead());
    }

    @Test
    @DisplayName("isOwnedBy() returns true when recipient email matches")
    void isOwnedBy_matchesByEmail() {
        User recipient = new User();
        recipient.setEmail("alice@example.com");
        Notification notification = new Notification();
        notification.setRecipient(recipient);

        assertTrue(notification.isOwnedBy("alice@example.com"));
    }

    @Test
    @DisplayName("isOwnedBy() returns false when recipient email differs")
    void isOwnedBy_rejectsDifferentEmail() {
        User recipient = new User();
        recipient.setEmail("alice@example.com");
        Notification notification = new Notification();
        notification.setRecipient(recipient);

        assertFalse(notification.isOwnedBy("bob@example.com"));
    }

    @Test
    @DisplayName("isOwnedBy() returns false when recipient is null")
    void isOwnedBy_handlesNullRecipient() {
        Notification notification = new Notification();

        assertFalse(notification.isOwnedBy("alice@example.com"));
    }
}
