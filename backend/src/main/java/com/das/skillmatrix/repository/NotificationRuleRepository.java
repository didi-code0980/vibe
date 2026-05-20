package com.das.skillmatrix.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.das.skillmatrix.entity.NotificationRule;
import com.das.skillmatrix.entity.TriggerEvent;

@Repository
public interface NotificationRuleRepository extends JpaRepository<NotificationRule, Long> {

    Optional<NotificationRule> findByTriggerEvent(TriggerEvent triggerEvent);

    List<NotificationRule> findAllByOrderByTriggerEventAsc();
}
