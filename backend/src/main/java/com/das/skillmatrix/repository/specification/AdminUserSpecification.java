package com.das.skillmatrix.repository.specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.das.skillmatrix.dto.request.AdminUserFilterRequest;
import com.das.skillmatrix.entity.GeneralStatus;
import com.das.skillmatrix.entity.Position;
import com.das.skillmatrix.entity.User;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

public final class AdminUserSpecification {

    private AdminUserSpecification() {
    }

    public static Specification<User> filter(AdminUserFilterRequest req) {
        return (root, query, cb) -> {
            query.distinct(true);
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (StringUtils.hasText(req.getSearch())) {
                String like = "%" + req.getSearch().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("fullName")), like),
                        cb.like(cb.lower(root.get("email")), like)
                ));
            }

            if (req.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), req.getStatus()));
            } else {
                predicates.add(cb.notEqual(root.get("status"), GeneralStatus.DELETED));
            }

            if (req.getPositionId() != null) {
                Join<User, Position> positionsJoin = root.join("positions", JoinType.LEFT);
                predicates.add(cb.equal(positionsJoin.get("positionId"), req.getPositionId()));
            }

            LocalDate from = req.getCreatedFrom();
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from.atStartOfDay()));
            }
            LocalDate to = req.getCreatedTo();
            if (to != null) {
                predicates.add(cb.lessThan(root.get("createdAt"), to.plusDays(1).atStartOfDay()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
