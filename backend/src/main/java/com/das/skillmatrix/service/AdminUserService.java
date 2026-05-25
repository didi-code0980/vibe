package com.das.skillmatrix.service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.das.skillmatrix.annotation.LogActivity;
import com.das.skillmatrix.constants.UsmConstants;
import com.das.skillmatrix.dto.request.AdminUserFilterRequest;
import com.das.skillmatrix.dto.request.AuditLogFilterRequest;
import com.das.skillmatrix.dto.request.CreateUserRequest;
import com.das.skillmatrix.dto.request.UpdateUserStatusRequest;
import com.das.skillmatrix.dto.response.AdminUserListItemResponse;
import com.das.skillmatrix.dto.response.AuditLogResponse;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.dto.response.UserResponse;
import com.das.skillmatrix.entity.GeneralStatus;
import com.das.skillmatrix.entity.TeamMember;
import com.das.skillmatrix.entity.User;
import com.das.skillmatrix.exception.ResourceNotFoundException;
import com.das.skillmatrix.repository.TeamMemberRepository;
import com.das.skillmatrix.repository.UserRepository;
import com.das.skillmatrix.repository.specification.AdminUserSpecification;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    private final TeamMemberRepository teamMemberRepository;

    private final UserService userService;

    private final PermissionService permissionService;

    private final BusinessChangeLogService logService;

    private final AuditLogQueryService auditLogQueryService;

    private final Clock clock;

    public UserResponse create(CreateUserRequest req) {
        return this.userService.create(req);
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminUserListItemResponse> list(AdminUserFilterRequest filter, Pageable pageable) {
        Pageable resolved = this.resolvePageable(filter, pageable);
        Specification<User> spec = AdminUserSpecification.filter(filter);
        Page<User> page = this.userRepository.findAll(spec, resolved);
        List<AdminUserListItemResponse> items = page.getContent().stream()
                .map(this::toListItem)
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

    @LogActivity(action = "UPDATE_USER_STATUS", entityType = "USER")
    public UserResponse updateStatus(Long userId, UpdateUserStatusRequest req) {
        User target = this.userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(UsmConstants.MSG_USER_NOT_FOUND));
        User actor = this.permissionService.getCurrentUser();
        if (target.isSameAs(actor)) {
            throw new IllegalArgumentException(UsmConstants.MSG_CANNOT_LOCK_SELF);
        }
        String newStatus = req.getStatus();
        GeneralStatus oldStatus = target.getStatus();
        if (UsmConstants.STATUS_LOCKED.equals(newStatus)) {
            target.lock();
            this.logService.log(UsmConstants.ACTION_USER_LOCKED, UsmConstants.ENTITY_USER, userId,
                    "status", String.valueOf(oldStatus), GeneralStatus.LOCKED.name());
        } else if (UsmConstants.STATUS_ACTIVE.equals(newStatus)) {
            target.unlock();
            this.logService.log(UsmConstants.ACTION_USER_UNLOCKED, UsmConstants.ENTITY_USER, userId,
                    "status", String.valueOf(oldStatus), GeneralStatus.ACTIVE.name());
        } else {
            throw new IllegalArgumentException(UsmConstants.MSG_INVALID_STATUS_TRANSITION);
        }
        User saved = this.userRepository.save(target);
        return this.toUserResponse(saved);
    }

    @LogActivity(action = "DELETE_USER", entityType = "USER")
    public void softDelete(Long userId) {
        User target = this.userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(UsmConstants.MSG_USER_NOT_FOUND));
        User actor = this.permissionService.getCurrentUser();
        if (target.isSameAs(actor)) {
            throw new IllegalArgumentException(UsmConstants.MSG_CANNOT_DELETE_SELF);
        }
        target.softDelete(this.clock);
        this.closeActiveTeamMemberships(target);
        this.userRepository.save(target);
        this.logService.log(UsmConstants.ACTION_USER_DELETED, UsmConstants.ENTITY_USER, userId,
                "status", "ACTIVE", GeneralStatus.DELETED.name());
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> findActivityForUser(Long userId, Pageable pageable) {
        if (!this.userRepository.existsById(userId)) {
            throw new ResourceNotFoundException(UsmConstants.MSG_USER_NOT_FOUND);
        }
        AuditLogFilterRequest filter = new AuditLogFilterRequest();
        filter.setActorId(userId);
        return this.auditLogQueryService.search(filter, pageable);
    }

    private void closeActiveTeamMemberships(User user) {
        List<TeamMember> memberships = this.teamMemberRepository.findByUser_UserId(user.getUserId());
        LocalDateTime now = LocalDateTime.now(this.clock);
        for (TeamMember tm : memberships) {
            if (tm.getLeftAt() == null) {
                tm.setLeftAt(now);
            }
        }
    }

    private AdminUserListItemResponse toListItem(User user) {
        AdminUserListItemResponse r = new AdminUserListItemResponse();
        r.setUserId(user.getUserId());
        r.setFullName(user.getFullName());
        r.setAvatarUrl(user.getUserAvatar());
        r.setEmail(user.getEmail());
        if (user.getPositions() != null && !user.getPositions().isEmpty()) {
            r.setPositionName(user.getPositions().get(0).getName());
        }
        r.setStatus(user.getStatus());
        r.setCreatedAt(user.getCreatedAt());
        return r;
    }

    private UserResponse toUserResponse(User user) {
        UserResponse r = new UserResponse();
        r.setUserId(user.getUserId());
        r.setEmail(user.getEmail());
        r.setFullName(user.getFullName());
        r.setUserAvatar(user.getUserAvatar());
        r.setRole(user.getRole());
        r.setStatus(user.getStatus());
        r.setCreatedAt(user.getCreatedAt());
        return r;
    }

    private Pageable resolvePageable(AdminUserFilterRequest filter, Pageable pageable) {
        int size = pageable.getPageSize();
        if (size <= 0) {
            size = UsmConstants.DEFAULT_PAGE_SIZE;
        }
        if (size > UsmConstants.MAX_PAGE_SIZE) {
            size = UsmConstants.MAX_PAGE_SIZE;
        }
        String sortField = this.resolveSortField(filter.getSortBy());
        Sort.Direction direction = UsmConstants.SORT_DIR_ASC.equalsIgnoreCase(filter.getSortDir())
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return PageRequest.of(pageable.getPageNumber(), size, Sort.by(direction, sortField));
    }

    private String resolveSortField(String sortBy) {
        if (UsmConstants.SORT_FULL_NAME.equals(sortBy)) {
            return "fullName";
        }
        return "createdAt";
    }
}
