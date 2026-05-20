package com.das.skillmatrix.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.das.skillmatrix.entity.SmtpConfig;

@Repository
public interface SmtpConfigRepository extends JpaRepository<SmtpConfig, Long> {
}
