package com.das.skillmatrix.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.das.skillmatrix.entity.EmailTemplate;
import com.das.skillmatrix.entity.TriggerEvent;

@Repository
public interface EmailTemplateRepository
        extends JpaRepository<EmailTemplate, Long>, JpaSpecificationExecutor<EmailTemplate> {

    Optional<EmailTemplate> findByTriggerEventAndIsActiveTrue(TriggerEvent triggerEvent);

    Optional<EmailTemplate> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    List<EmailTemplate> findAllByOrderByNameAsc();

    Page<EmailTemplate> findAll(Pageable pageable);
}
