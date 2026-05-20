package com.das.skillmatrix.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.das.skillmatrix.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipient_UserId(Long userId, Pageable pageable);

    Page<Notification> findByRecipient_UserIdAndIsRead(
            Long userId, Boolean isRead, Pageable pageable);

    long countByRecipient_UserIdAndIsReadFalse(Long userId);

    @Modifying
    @Query("""
            UPDATE Notification n
            SET n.isRead = true
            WHERE n.recipient.userId = :userId
                AND n.isRead = false
            """)
    int markAllAsReadForUser(@Param("userId") Long userId);
}
