package com.das.skillmatrix.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import com.das.skillmatrix.constants.ProfileConstants;
import com.das.skillmatrix.dto.request.UpdateProfileRequest;
import com.das.skillmatrix.dto.request.UpdateProfileSettingsRequest;
import com.das.skillmatrix.dto.response.AssessmentHistoryItemResponse;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.dto.response.ProfileResponse;
import com.das.skillmatrix.dto.response.ProfileSettingsResponse;
import com.das.skillmatrix.dto.response.ProfileTeamResponse;
import com.das.skillmatrix.entity.GeneralStatus;
import com.das.skillmatrix.entity.Language;
import com.das.skillmatrix.entity.Skill;
import com.das.skillmatrix.entity.Team;
import com.das.skillmatrix.entity.TeamMember;
import com.das.skillmatrix.entity.User;
import com.das.skillmatrix.entity.UserSkillEvaluation;
import com.das.skillmatrix.exception.ResourceNotFoundException;
import com.das.skillmatrix.repository.TeamMemberRepository;
import com.das.skillmatrix.repository.UserRepository;
import com.das.skillmatrix.repository.UserSkillEvaluationRepository;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    private static final String EMAIL = "alice@example.com";

    @Mock
    private UserRepository userRepository;

    @Mock
    private TeamMemberRepository teamMemberRepository;

    @Mock
    private UserSkillEvaluationRepository userSkillEvaluationRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private ProfileService profileService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setEmail(EMAIL);
        user.setFullName("Alice");
        user.setPhone("0123456789");
        user.setRole("STAFF");
        user.setStatus(GeneralStatus.ACTIVE);
        user.setNotificationEmail(true);
        user.setLanguage(Language.EN);
        user.setPositions(new ArrayList<>());
    }

    @Test
    @DisplayName("getCurrentProfile() returns mapped response when user exists")
    void getCurrentProfile_returnsMappedResponse() {
        when(userRepository.findUserByEmail(EMAIL)).thenReturn(user);

        ProfileResponse response = profileService.getCurrentProfile(EMAIL);

        assertNotNull(response);
        assertEquals(1L, response.getUserId());
        assertEquals(EMAIL, response.getEmail());
        assertEquals("Alice", response.getFullName());
        assertTrue(response.isNotificationEmail());
        assertEquals(Language.EN, response.getLanguage());
    }

    @Test
    @DisplayName("getCurrentProfile() throws when user not found")
    void getCurrentProfile_throwsWhenUserMissing() {
        when(userRepository.findUserByEmail(EMAIL)).thenReturn(null);

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> profileService.getCurrentProfile(EMAIL));
        assertEquals(ProfileConstants.MSG_PROFILE_NOT_FOUND, ex.getMessage());
    }

    @Test
    @DisplayName("updateProfile() saves new full name and phone")
    void updateProfile_savesNewValues() {
        when(userRepository.findUserByEmail(EMAIL)).thenReturn(user);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateProfileRequest request = new UpdateProfileRequest("Alice Updated", "0987654321");

        ProfileResponse response = profileService.updateProfile(EMAIL, request);

        assertEquals("Alice Updated", response.getFullName());
        assertEquals("0987654321", response.getPhone());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("uploadAvatar() stores new file, updates user, and deletes old avatar")
    void uploadAvatar_replacesOldAvatar() {
        user.setUserAvatar("/static/avatars/old.png");
        MultipartFile file = new MockMultipartFile(
                "file", "avatar.png", "image/png", new byte[]{1, 2, 3});

        when(userRepository.findUserByEmail(EMAIL)).thenReturn(user);
        when(fileStorageService.storeAvatar(eq(1L), eq(file)))
                .thenReturn("/static/avatars/new.png");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        String url = profileService.uploadAvatar(EMAIL, file);

        assertEquals("/static/avatars/new.png", url);
        assertEquals("/static/avatars/new.png", user.getUserAvatar());
        verify(fileStorageService, times(1)).deleteAvatar("/static/avatars/old.png");
    }

    @Test
    @DisplayName("uploadAvatar() does not delete when there is no previous avatar")
    void uploadAvatar_skipsDeleteWhenNoPrevious() {
        user.setUserAvatar(null);
        MultipartFile file = new MockMultipartFile(
                "file", "avatar.png", "image/png", new byte[]{1, 2});

        when(userRepository.findUserByEmail(EMAIL)).thenReturn(user);
        when(fileStorageService.storeAvatar(anyLong(), any(MultipartFile.class)))
                .thenReturn("/static/avatars/new.png");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        profileService.uploadAvatar(EMAIL, file);

        verify(fileStorageService, never()).deleteAvatar(anyString());
    }

    @Test
    @DisplayName("getSettings() returns notificationEmail + language")
    void getSettings_returnsValues() {
        when(userRepository.findUserByEmail(EMAIL)).thenReturn(user);

        ProfileSettingsResponse response = profileService.getSettings(EMAIL);

        assertTrue(response.isNotificationEmail());
        assertEquals(Language.EN, response.getLanguage());
    }

    @Test
    @DisplayName("updateSettings() persists new values")
    void updateSettings_persistsValues() {
        when(userRepository.findUserByEmail(EMAIL)).thenReturn(user);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateProfileSettingsRequest request = new UpdateProfileSettingsRequest(false, Language.VI);

        ProfileSettingsResponse response = profileService.updateSettings(EMAIL, request);

        assertEquals(false, response.isNotificationEmail());
        assertEquals(Language.VI, response.getLanguage());
        assertEquals(Language.VI, user.getLanguage());
    }

    @Test
    @DisplayName("getAssessmentHistory() returns paginated mapped items")
    void getAssessmentHistory_returnsPagedItems() {
        Skill skill = new Skill();
        skill.setSkillId(11L);
        skill.setName("Java");

        UserSkillEvaluation evaluation = new UserSkillEvaluation();
        evaluation.setEvaluationId(100L);
        evaluation.setUser(user);
        evaluation.setSkill(skill);
        evaluation.setScore(4);
        evaluation.setEvaluationType(ProfileConstants.EVALUATION_TYPE_SELF);

        Pageable pageable = PageRequest.of(0, 20);
        Page<UserSkillEvaluation> page = new PageImpl<>(List.of(evaluation), pageable, 1);

        when(userRepository.findUserByEmail(EMAIL)).thenReturn(user);
        when(userSkillEvaluationRepository.findByUserIdOrderByAssessedAtDesc(1L, pageable))
                .thenReturn(page);

        PageResponse<AssessmentHistoryItemResponse> response =
                profileService.getAssessmentHistory(EMAIL, pageable);

        assertEquals(1, response.getItems().size());
        AssessmentHistoryItemResponse item = response.getItems().get(0);
        assertEquals(100L, item.getEvaluationId());
        assertEquals("Java", item.getSkillName());
        assertEquals(4, item.getSelfScore());
        assertNull(item.getManagerScore());
    }

    @Test
    @DisplayName("getMyTeam() returns team info, manager name, and teammates without self")
    void getMyTeam_returnsTeamInfo() {
        Team team = new Team();
        team.setTeamId(7L);
        team.setName("Falcons");
        User manager = new User();
        manager.setUserId(2L);
        manager.setFullName("Bob Manager");
        team.setManagers(List.of(manager));

        TeamMember selfMembership = new TeamMember();
        selfMembership.setTeam(team);
        selfMembership.setUser(user);

        User mate = new User();
        mate.setUserId(3L);
        mate.setFullName("Carol");
        TeamMember mateMembership = new TeamMember();
        mateMembership.setTeam(team);
        mateMembership.setUser(mate);

        when(userRepository.findUserByEmail(EMAIL)).thenReturn(user);
        when(teamMemberRepository.findByUser_UserId(1L)).thenReturn(List.of(selfMembership));
        when(teamMemberRepository.findByTeam_TeamId(eq(7L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(selfMembership, mateMembership)));
        when(userSkillEvaluationRepository.findByUserIdsAndEvaluationType(anyList(), eq(ProfileConstants.EVALUATION_TYPE_SELF)))
                .thenReturn(Collections.emptyList());

        ProfileTeamResponse response = profileService.getMyTeam(EMAIL);

        assertEquals(7L, response.getTeamId());
        assertEquals("Falcons", response.getTeamName());
        assertEquals("Bob Manager", response.getManagerFullName());
        assertEquals(1, response.getTeammates().size());
        assertEquals(3L, response.getTeammates().get(0).getUserId());
    }

    @Test
    @DisplayName("getMyTeam() throws when user has no team")
    void getMyTeam_throwsWhenNoTeam() {
        when(userRepository.findUserByEmail(EMAIL)).thenReturn(user);
        when(teamMemberRepository.findByUser_UserId(1L)).thenReturn(Collections.emptyList());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> profileService.getMyTeam(EMAIL));
        assertEquals(ProfileConstants.MSG_TEAM_NOT_FOUND, ex.getMessage());
    }
}