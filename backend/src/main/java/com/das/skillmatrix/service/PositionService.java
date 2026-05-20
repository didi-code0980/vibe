package com.das.skillmatrix.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.das.skillmatrix.constants.ConfigConstants;
import com.das.skillmatrix.dto.request.PositionCreateRequest;
import com.das.skillmatrix.dto.request.PositionFilterRequest;
import com.das.skillmatrix.dto.request.PositionUpdateRequest;
import com.das.skillmatrix.dto.request.RequiredSkillEntry;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.dto.response.PositionDetailResponse;
import com.das.skillmatrix.dto.response.PositionDetailResponse.RequiredSkillResponse;
import com.das.skillmatrix.entity.GeneralStatus;
import com.das.skillmatrix.entity.Position;
import com.das.skillmatrix.entity.PositionSkill;
import com.das.skillmatrix.entity.Skill;
import com.das.skillmatrix.exception.ResourceNotFoundException;
import com.das.skillmatrix.repository.PositionRepository;
import com.das.skillmatrix.repository.SkillRepository;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class PositionService {

    private final PositionRepository positionRepository;

    private final SkillRepository skillRepository;

    @Transactional(readOnly = true)
    public PageResponse<PositionDetailResponse> list(PositionFilterRequest filter, Pageable pageable) {
        Specification<Position> spec = this.buildSpecification(filter);
        Page<Position> page = this.positionRepository.findAll(spec, pageable);
        List<PositionDetailResponse> data = page.getContent().stream()
                .map(this::toDetailResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(
                data,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext(),
                page.hasPrevious()
        );
    }

    @Transactional(readOnly = true)
    public PositionDetailResponse getDetail(Long positionId) {
        Position position = this.findPositionById(positionId);
        return this.toDetailResponse(position);
    }

    public PositionDetailResponse create(PositionCreateRequest request) {
        this.validateNameUnique(request.getName(), null);
        Position position = new Position();
        position.setName(request.getName().trim());
        position.setDescription(request.getDescription());
        position.setStatus(GeneralStatus.ACTIVE);
        position.setPositionSkills(new ArrayList<>());
        this.applyRequiredSkills(position, request.getRequiredSkills());
        Position saved = this.positionRepository.save(position);
        return this.toDetailResponse(saved);
    }

    public PositionDetailResponse update(Long positionId, PositionUpdateRequest request) {
        Position position = this.findPositionById(positionId);
        this.validateNameUnique(request.getName(), positionId);
        position.setName(request.getName().trim());
        position.setDescription(request.getDescription());
        if (position.getPositionSkills() != null) {
            position.getPositionSkills().clear();
        } else {
            position.setPositionSkills(new ArrayList<>());
        }
        this.applyRequiredSkills(position, request.getRequiredSkills());
        return this.toDetailResponse(position);
    }

    public void delete(Long positionId) {
        Position position = this.findPositionById(positionId);
        position.setStatus(GeneralStatus.DELETED);
    }

    private Position findPositionById(Long positionId) {
        return this.positionRepository.findById(positionId)
                .orElseThrow(() -> new ResourceNotFoundException(ConfigConstants.MSG_POSITION_NOT_FOUND));
    }

    private void validateNameUnique(String name, Long excludeId) {
        boolean exists = excludeId == null
                ? this.positionRepository.existsByNameIgnoreCase(name)
                : this.positionRepository.existsByNameIgnoreCaseAndPositionIdNot(name, excludeId);
        if (exists) {
            throw new IllegalArgumentException(ConfigConstants.MSG_POSITION_NAME_EXISTS);
        }
    }

    private void applyRequiredSkills(Position position, List<RequiredSkillEntry> entries) {
        if (entries == null || entries.isEmpty()) {
            return;
        }
        Map<Long, Skill> skillsById = this.loadSkillsByIds(entries);
        for (RequiredSkillEntry entry : entries) {
            Skill skill = skillsById.get(entry.getSkillId());
            if (skill == null) {
                throw new IllegalArgumentException(ConfigConstants.MSG_SKILL_REF_INVALID);
            }
            PositionSkill ps = new PositionSkill();
            ps.setPosition(position);
            ps.setSkill(skill);
            ps.setMinLevel(entry.getMinLevel());
            position.getPositionSkills().add(ps);
        }
    }

    private Map<Long, Skill> loadSkillsByIds(List<RequiredSkillEntry> entries) {
        List<Long> ids = entries.stream().map(RequiredSkillEntry::getSkillId).toList();
        List<Skill> skills = this.skillRepository.findAllById(ids);
        Map<Long, Skill> map = new HashMap<>();
        for (Skill s : skills) {
            map.put(s.getSkillId(), s);
        }
        return map;
    }

    private Specification<Position> buildSpecification(PositionFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (filter != null) {
                if (StringUtils.hasText(filter.getKeyword())) {
                    predicates.add(cb.like(
                            cb.lower(root.get("name")),
                            "%" + filter.getKeyword().toLowerCase() + "%"));
                }
                if (StringUtils.hasText(filter.getStatus())) {
                    try {
                        GeneralStatus status = GeneralStatus.valueOf(filter.getStatus().toUpperCase());
                        predicates.add(cb.equal(root.get("status"), status));
                    } catch (IllegalArgumentException ex) {
                        log.debug("Ignoring invalid status filter: {}", filter.getStatus());
                    }
                }
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private PositionDetailResponse toDetailResponse(Position position) {
        List<RequiredSkillResponse> required = position.getPositionSkills() == null
                ? List.of()
                : position.getPositionSkills().stream()
                        .map(ps -> RequiredSkillResponse.builder()
                                .skillId(ps.getSkill().getSkillId())
                                .skillName(ps.getSkill().getName())
                                .minLevel(ps.getMinLevel())
                                .build())
                        .collect(Collectors.toList());
        return PositionDetailResponse.builder()
                .positionId(position.getPositionId())
                .name(position.getName())
                .description(position.getDescription())
                .status(position.getStatus())
                .requiredSkills(required)
                .build();
    }
}
