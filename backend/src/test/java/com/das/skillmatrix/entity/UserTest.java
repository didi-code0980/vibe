package com.das.skillmatrix.entity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UserTest {

    private static final LocalDateTime FIXED_NOW = LocalDateTime.of(2026, 1, 15, 10, 0);

    private Clock fixedClock() {
        return Clock.fixed(FIXED_NOW.atZone(ZoneId.systemDefault()).toInstant(), ZoneId.systemDefault());
    }

    @Test
    @DisplayName("softDelete() sets status to DELETED and stamps deletedAt from the clock")
    void softDelete_setsStatusAndDeletedAt() {
        User user = new User();
        user.setStatus(GeneralStatus.ACTIVE);

        user.softDelete(this.fixedClock());

        assertEquals(GeneralStatus.DELETED, user.getStatus());
        assertNotNull(user.getDeletedAt());
        assertEquals(FIXED_NOW, user.getDeletedAt());
    }

    @Test
    @DisplayName("lock() sets status to LOCKED without changing deletedAt")
    void lock_setsStatusToLocked() {
        User user = new User();
        user.setStatus(GeneralStatus.ACTIVE);

        user.lock();

        assertEquals(GeneralStatus.LOCKED, user.getStatus());
        assertNull(user.getDeletedAt());
    }

    @Test
    @DisplayName("unlock() restores status to ACTIVE from LOCKED")
    void unlock_setsStatusToActive() {
        User user = new User();
        user.setStatus(GeneralStatus.LOCKED);

        user.unlock();

        assertEquals(GeneralStatus.ACTIVE, user.getStatus());
    }

    @Test
    @DisplayName("isSameAs() returns true only when userIds match")
    void isSameAs_matchesById() {
        User a = new User();
        a.setUserId(7L);
        User b = new User();
        b.setUserId(7L);
        User c = new User();
        c.setUserId(9L);

        assertTrue(a.isSameAs(b));
        assertFalse(a.isSameAs(c));
        assertFalse(a.isSameAs(null));
    }

    @Test
    @DisplayName("isAdmin() returns true when role is ADMIN")
    void isAdmin_recognisesAdminRole() {
        User admin = new User();
        admin.setRole("ADMIN");
        User staff = new User();
        staff.setRole("STAFF");

        assertTrue(admin.isAdmin());
        assertFalse(staff.isAdmin());
    }

    @Test
    @DisplayName("isDeleted() returns true when status is DELETED")
    void isDeleted_reflectsStatus() {
        User user = new User();
        user.setStatus(GeneralStatus.DELETED);

        assertTrue(user.isDeleted());
    }

}