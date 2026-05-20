package com.das.skillmatrix.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.das.skillmatrix.entity.RatingScale;

@Repository
public interface RatingScaleRepository extends JpaRepository<RatingScale, Long> {

    List<RatingScale> findAllByOrderByLevelAsc();

    Optional<RatingScale> findByLevel(int level);
}
