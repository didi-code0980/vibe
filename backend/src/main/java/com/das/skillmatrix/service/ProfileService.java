package com.das.skillmatrix.service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.das.skillmatrix.constants.ProfileConstants;
import com.das.skillmatrix.dto.request.UpdateProfileRequest;
import com.das.skillmatrix.dto.request.UpdateProfileSettingsRequest;
import com.das.skillmatrix.dto.response.AssessmentHistoryItemResponse;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.dto.response.PositionBrief;
import com.das.skillmatrix.dto.response.ProfileResponse;
import com.das.skillmatrix.dto.response.ProfileSettingsResponse;
import com.das.skillmatrix.dto.response.ProfileTeamResponse;
import com.das.skillmatrix.dto.response.ProfileTeamResponse.PublicSkillScore;
import com.das.skillmatrix.dto.response.ProfileTeamResponse.TeammateBrief;
import com.das.skillmatrix.entity.Department;
import com.das.skillmatrix.entity.Team;
import com.das.skillmatrix.entity.TeamMember;
import com.das.skillmatrix.entity.User;
import com.das.skillmatrix.entity.UserSkillEvaluation;
import com.das.skillmatrix.exception.ResourceNotFoundException;
import com.das.skillmatrix.repository.TeamMemberRepository;
import com.das.skillmatrix.repository.UserRepository;
import com.das.skillmatrix.repository.UserSkillEvaluationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;

    private final TeamMemberRepository teamMemberRepository;

    private final UserSkillEvaluationRepository userSkillEvaluationRepository;

    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public ProfileResponse getCurrentProfile(String email) {
        User user = this.findActiveUserByEmail(email);
        return this.mapToProfileResponse(user);
    }

    public ProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = this.findActiveUserByEmail(email);
        user.setFullName(request.getFullName().trim());
        user.setPhone(request.getPhone());
        User saved = this.userRepository.save(user);
        return this.mapToProfileResponse(saved);
    }

    public String uploadAvatar(String email, MultipartFile file) {
        User user = this.findActiveUserByEmail(email);
        String oldAvatar = user.getUserAvatar();
        String newAvatarUrl = this.fileStorageService.storeAvatar(user.getUserId(), file);
        user.setUserAvatar(newAvatarUrl);
        this.userRepository.save(user);
        if (oldAvatar != null && !oldAvatar.equals(newAvatarUrl)) {
            this.fileStorageService.deleteAvatar(oldAvatar);
        }
        return newAvatarUrl;
    }

    public void removeAvatar(String email) {
        User user = this.findActiveUserByEmail(email);
        String oldAvatar = user.getUserAvatar();
        if (oldAvatar == null) {
            return;
        }
        user.setUserAvatar(null);
        this.userRepository.save(user);
        this.fileStorageService.deleteAvatar(oldAvatar);
    }

    @Transactional(readOnly = true)
    public ProfileSettingsResponse getSettings(String email) {
        User user = this.findActiveUserByEmail(email);
        return new ProfileSettingsResponse(user.isNotificationEmail(), user.getLanguage());
    }

    public ProfileSettingsResponse updateSettings(String email, UpdateProfileSettingsRequest request) {
        User user = this.findActiveUserByEmail(email);
        user.setNotificationEmail(Boolean.TRUE.equals(request.getNotificationEmail()));
        user.setLanguage(request.getLanguage());
        User saved = this.userRepository.save(user);
        return new ProfileSettingsResponse(saved.isNotificationEmail(), saved.getLanguage());
    }

    @Transactional(readOnly = true)
    public PageResponse<AssessmentHistoryItemResponse> getAssessmentHistory(String email, Pageable pageable) {
        User user = this.findActiveUserByEmail(email);
        Page<UserSkillEvaluation> page = this.userSkillEvaluationRepository
                .findByUserIdOrderByAssessedAtDesc(user.getUserId(), pageable);
        List<AssessmentHistoryItemResponse> items = page.getContent().stream()
                .map(this::mapToAssessmentHistoryItem)
                .collect(Collectors.toList());
        return new PageResponse<>(
                items,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.hasNext(),
                page.hasPrevious()
        );
    }

    @Transactional(readOnly = true)
    public ProfileTeamResponse getMyTeam(String email) {
        User user = this.findActiveUserByEmail(email);
        Team team = this.resolveCurrentTeam(user);
        if (team == null) {
            throw new ResourceNotFoundException(ProfileConstants.MSG_TEAM_NOT_FOUND);
        }
        String managerName = this.resolveManagerFullName(team);
        List<TeamMember> members = this.teamMemberRepository.findByTeam_TeamId(team.getTeamId(), Pageable.unpaged())
                .getContent();
        List<Long> teammateIds = members.stream()
                .map(m -> m.getUser().getUserId())
                .filter(id -> !id.equals(user.getUserId()))
                .collect(Collectors.toList());
        Map<Long, List<PublicSkillScore>> skillsByUser = this.fetchPublicSkillsByUserIds(teammateIds);
        List<TeammateBrief> teammates = members.stream()
                .filter(m -> !m.getUser().getUserId().equals(user.getUserId()))
                .map(m -> this.mapToTeammateBrief(m.getUser(), skillsByUser))
                .collect(Collectors.toList());
        return ProfileTeamResponse.builder()
                .teamId(team.getTeamId())
                .teamName(team.getName())
                .managerFullName(managerName)
                .teammates(teammates)
                .build();
    }

    private User findActiveUserByEmail(String email) {
        User user = this.userRepository.findUserByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException(ProfileConstants.MSG_PROFILE_NOT_FOUND);
        }
        return user;
    }

    private Team resolveCurrentTeam(User user) {
        List<TeamMember> memberships = this.teamMemberRepository.findByUser_UserId(user.getUserId());
        if (!memberships.isEmpty()) {
            return memberships.get(0).getTeam();
        }
        if (!user.getManagedTeams().isEmpty()) {
            return user.getManagedTeams().get(0);
        }
        return null;
    }

    private String resolveManagerFullName(Team team) {
        if (team.getManagers() == null || team.getManagers().isEmpty()) {
            return null;
        }
        return team.getManagers().get(0).getFullName();
    }

    private Map<Long, List<PublicSkillScore>> fetchPublicSkillsByUserIds(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<UserSkillEvaluation> evaluations = this.userSkillEvaluationRepository
                .findByUserIdsAndEvaluationType(userIds, ProfileConstants.EVALUATION_TYPE_SELF);
        return evaluations.stream()
                .filter(e -> e.getSkill() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getUser().getUserId(),
                        Collectors.mapping(this::mapToPublicSkillScore, Collectors.toList())
                ));
    }

    private PublicSkillScore mapToPublicSkillScore(UserSkillEvaluation evaluation) {
        return PublicSkillScore.builder()
                .skillId(evaluation.getSkill().getSkillId())
                .skillName(evaluation.getSkill().getName())
                .selfScore(evaluation.getScore())
                .build();
    }

    private TeammateBrief mapToTeammateBrief(User member, Map<Long, List<PublicSkillScore>> skillsByUser) {
        return TeammateBrief.builder()
                .userId(member.getUserId())
                .fullName(member.getFullName())
                .userAvatar(member.getUserAvatar())
                .skills(skillsByUser.getOrDefault(member.getUserId(), Collections.emptyList()))
                .build();
    }

    private AssessmentHistoryItemResponse mapToAssessmentHistoryItem(UserSkillEvaluation evaluation) {
        Integer selfScore = ProfileConstants.EVALUATION_TYPE_SELF.equals(evaluation.getEvaluationType())
                ? evaluation.getScore() : null;
        Integer managerScore = ProfileConstants.EVALUATION_TYPE_MANAGER.equals(evaluation.getEvaluationType())
                ? evaluation.getScore() : null;
        String skillName = evaluation.getSkill() != null ? evaluation.getSkill().getName() : null;
        Long skillId = evaluation.getSkill() != null ? evaluation.getSkill().getSkillId() : null;
        return AssessmentHistoryItemResponse.builder()
                .evaluationId(evaluation.getEvaluationId())
                .skillId(skillId)
                .skillName(skillName)
                .departmentName(this.resolveDepartmentName(evaluation.getUser()))
                .selfScore(selfScore)
                .managerScore(managerScore)
                .assessedAt(evaluation.getUpdatedAt() != null
                        ? evaluation.getUpdatedAt() : evaluation.getCreatedAt())
                .build();
    }

    private String resolveDepartmentName(User user) {
        Department department = user.getDepartment();
        return department != null ? department.getName() : null;
    }

    private ProfileResponse mapToProfileResponse(User user) {
        List<PositionBrief> positions = user.getPositions().stream()
                .map(p -> new PositionBrief(p.getPositionId(), p.getName()))
                .collect(Collectors.toList());
        ProfileResponse.ProfileResponseBuilder builder = ProfileResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .userAvatar(user.getUserAvatar())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .mustChangePassword(user.isMustChangePassword())
                .notificationEmail(user.isNotificationEmail())
                .language(user.getLanguage())
                .positions(positions)
                .createdAt(user.getCreatedAt());
        this.applyScopeFields(user, builder);
        return builder.build();
    }

    private void applyScopeFields(User user, ProfileResponse.ProfileResponseBuilder builder) {
        if (!user.getManagedCareers().isEmpty()) {
            builder.careerId(user.getManagedCareers().get(0).getCareerId());
            builder.careerName(user.getManagedCareers().get(0).getName());
            return;
        }
        if (!user.getManagedDepartments().isEmpty()) {
            builder.departmentId(user.getManagedDepartments().get(0).getDepartmentId());
            builder.departmentName(user.getManagedDepartments().get(0).getName());
            return;
        }
        if (!user.getManagedTeams().isEmpty()) {
            Team team = user.getManagedTeams().get(0);
            builder.teamId(team.getTeamId());
            builder.teamName(team.getName());
            if (team.getDepartment() != null) {
                builder.departmentId(team.getDepartment().getDepartmentId());
                builder.departmentName(team.getDepartment().getName());
            }
            return;
        }
        if (user.getDepartment() != null) {
            builder.departmentId(user.getDepartment().getDepartmentId());
            builder.departmentName(user.getDepartment().getName());
            List<TeamMember> memberships = this.teamMemberRepository.findByUser_UserId(user.getUserId());
            if (!memberships.isEmpty()) {
                Team team = memberships.get(0).getTeam();
                builder.teamId(team.getTeamId());
                builder.teamName(team.getName());
            }
        }
    }
}
