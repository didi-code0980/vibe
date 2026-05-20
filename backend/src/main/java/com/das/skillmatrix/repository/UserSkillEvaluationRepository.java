package com.das.skillmatrix.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.das.skillmatrix.entity.UserSkillEvaluation;

@Repository
public interface UserSkillEvaluationRepository extends JpaRepository<UserSkillEvaluation, Long> {

    @Query("""
            SELECT e
            FROM UserSkillEvaluation e
            WHERE e.user.userId = :userId
            ORDER BY e.updatedAt DESC
            """)
    Page<UserSkillEvaluation> findByUserIdOrderByAssessedAtDesc(
            @Param("userId") Long userId,
            Pageable pageable);

    @Query("""
            SELECT e
            FROM UserSkillEvaluation e
            WHERE e.user.userId IN :userIds
                AND e.evaluationType = :evaluationType
            """)
    List<UserSkillEvaluation> findByUserIdsAndEvaluationType(
            @Param("userIds") List<Long> userIds,
            @Param("evaluationType") String evaluationType);
}