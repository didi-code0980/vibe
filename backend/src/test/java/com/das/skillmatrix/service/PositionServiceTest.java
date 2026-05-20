package com.das.skillmatrix.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.das.skillmatrix.constants.ConfigConstants;
import com.das.skillmatrix.dto.request.PositionCreateRequest;
import com.das.skillmatrix.dto.request.PositionUpdateRequest;
import com.das.skillmatrix.dto.request.RequiredSkillEntry;
import com.das.skillmatrix.dto.response.PositionDetailResponse;
import com.das.skillmatrix.entity.GeneralStatus;
import com.das.skillmatrix.entity.Position;
import com.das.skillmatrix.entity.Skill;
import com.das.skillmatrix.exception.ResourceNotFoundException;
import com.das.skillmatrix.repository.PositionRepository;
import com.das.skillmatrix.repository.SkillRepository;

@ExtendWith(MockitoExtension.class)
class PositionServiceTest {

    @Mock
    private PositionRepository positionRepository;

    @Mock
    private SkillRepository skillRepository;

    @InjectMocks
    private PositionService positionService;

    private Skill javaSkill;

    @BeforeEach
    void setUp() {
        javaSkill = new Skill();
        javaSkill.setSkillId(11L);
        javaSkill.setName("Java");
    }

    @Test
    @DisplayName("create() saves new position with required skills")
    void create_savesPositionWithRequiredSkills() {
        PositionCreateRequest request = new PositionCreateRequest(
                "Backend Developer",
                "Backend role",
                List.of(new RequiredSkillEntry(11L, 3)));

        when(positionRepository.existsByNameIgnoreCase("Backend Developer")).thenReturn(false);
        when(skillRepository.findAllById(anyList())).thenReturn(List.of(javaSkill));
        when(positionRepository.save(any(Position.class))).thenAnswer(inv -> {
            Position p = inv.getArgument(0);
            p.setPositionId(1L);
            return p;
        });

        PositionDetailResponse response = positionService.create(request);

        assertNotNull(response);
        assertEquals("Backend Developer", response.getName());
        assertEquals(1, response.getRequiredSkills().size());
        assertEquals(3, response.getRequiredSkills().get(0).getMinLevel());
    }

    @Test
    @DisplayName("create() throws when name already exists")
    void create_throwsWhenNameExists() {
        PositionCreateRequest request = new PositionCreateRequest("Backend Developer", null, List.of());
        when(positionRepository.existsByNameIgnoreCase("Backend Developer")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> positionService.create(request));
        assertEquals(ConfigConstants.MSG_POSITION_NAME_EXISTS, ex.getMessage());
    }

    @Test
    @DisplayName("create() throws when required skill is unknown")
    void create_throwsWhenSkillUnknown() {
        PositionCreateRequest request = new PositionCreateRequest(
                "QA Engineer",
                null,
                List.of(new RequiredSkillEntry(999L, 2)));

        when(positionRepository.existsByNameIgnoreCase("QA Engineer")).thenReturn(false);
        when(skillRepository.findAllById(anyList())).thenReturn(List.of());

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> positionService.create(request));
        assertEquals(ConfigConstants.MSG_SKILL_REF_INVALID, ex.getMessage());
    }

    @Test
    @DisplayName("update() replaces required skills")
    void update_replacesRequiredSkills() {
        Position existing = new Position();
        existing.setPositionId(1L);
        existing.setName("Backend");
        existing.setStatus(GeneralStatus.ACTIVE);
        existing.setPositionSkills(new java.util.ArrayList<>());

        when(positionRepository.findById(1L)).thenReturn(java.util.Optional.of(existing));
        when(positionRepository.existsByNameIgnoreCaseAndPositionIdNot("Backend Pro", 1L)).thenReturn(false);
        when(skillRepository.findAllById(anyList())).thenReturn(List.of(javaSkill));

        PositionUpdateRequest request = new PositionUpdateRequest(
                "Backend Pro",
                "desc",
                List.of(new RequiredSkillEntry(11L, 4)));

        PositionDetailResponse response = positionService.update(1L, request);

        assertEquals("Backend Pro", response.getName());
        assertEquals(1, response.getRequiredSkills().size());
        assertEquals(4, response.getRequiredSkills().get(0).getMinLevel());
    }

    @Test
    @DisplayName("delete() sets status to DELETED")
    void delete_softDeletesPosition() {
        Position existing = new Position();
        existing.setPositionId(1L);
        existing.setStatus(GeneralStatus.ACTIVE);
        when(positionRepository.findById(1L)).thenReturn(java.util.Optional.of(existing));

        positionService.delete(1L);

        assertEquals(GeneralStatus.DELETED, existing.getStatus());
    }

    @Test
    @DisplayName("getDetail() throws ResourceNotFoundException when missing")
    void getDetail_throwsWhenMissing() {
        when(positionRepository.findById(99L)).thenReturn(java.util.Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> positionService.getDetail(99L));
        assertEquals(ConfigConstants.MSG_POSITION_NOT_FOUND, ex.getMessage());
        verify(positionRepository).findById(99L);
    }
}
