package com.das.skillmatrix.repository.specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.das.skillmatrix.dto.request.AuditLogFilterRequest;
import com.das.skillmatrix.entity.AuditLog;

import jakarta.persistence.criteria.Predicate;

public class AuditLogSpecification {

    private AuditLogSpecification() {
    }

    public static Specification<AuditLog> filter(AuditLogFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getActorId() != null) {
                predicates.add(cb.equal(root.get("userId"), filter.getActorId()));
            }
            if (StringUtils.hasText(filter.getEntityType())) {
                predicates.add(cb.equal(
                        cb.upper(root.get("entityType")),
                        filter.getEntityType().toUpperCase()));
            }
            if (filter.getEntityId() != null) {
                predicates.add(cb.equal(root.get("entityId"), filter.getEntityId()));
            }
            if (StringUtils.hasText(filter.getAction())) {
                predicates.add(cb.like(
                        cb.upper(root.get("action")),
                        "%" + filter.getAction().toUpperCase() + "%"));
            }
            LocalDateTime fromDate = filter.getFromDate();
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate));
            }
            LocalDateTime toDate = filter.getToDate();
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), toDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
