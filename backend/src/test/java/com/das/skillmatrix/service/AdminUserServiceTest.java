package com.das.skillmatrix.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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
import org.springframework.data.jpa.domain.Specification;

import com.das.skillmatrix.dto.request.AdminUserFilterRequest;
import com.das.skillmatrix.dto.request.AuditLogFilterRequest;
import com.das.skillmatrix.dto.request.UpdateUserStatusRequest;
import com.das.skillmatrix.dto.response.AdminUserListItemResponse;
import com.das.skillmatrix.dto.response.AuditLogResponse;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.dto.response.UserResponse;
import com.das.skillmatrix.entity.GeneralStatus;
import com.das.skillmatrix.entity.Position;
import com.das.skillmatrix.entity.TeamMember;
import com.das.skillmatrix.entity.User;
import com.das.skillmatrix.exception.ResourceNotFoundException;
import com.das.skillmatrix.repository.TeamMemberRepository;
import com.das.skillmatrix.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TeamMemberRepository teamMemberRepository;

    @Mock
    private UserService userService;

    @Mock
    private PermissionService permissionService;

    @Mock
    private BusinessChangeLogService logService;

    @Mock
    private AuditLogQueryService auditLogQueryService;

    private final LocalDateTime fixedNow = LocalDateTime.of(2026, 1, 15, 9, 0);

    private final Clock fixedClock = Clock.fixed(this.fixedNow.atZone(ZoneId.systemDefault()).toInstant(),
            ZoneId.systemDefault());

    private AdminUserService adminUserService;

    private User user(Long id, String email, String role, GeneralStatus status) {
        User u = new User();
        u.setUserId(id);
        u.setEmail(email);
        u.setFullName("User " + id);
        u.setRole(role);
        u.setStatus(status);
        u.setPositions(new ArrayList<>());
        return u;
    }

    private AdminUserService buildService() {
        return new AdminUserService(
                this.userRepository,
                this.teamMemberRepository,
                this.userService,
                this.permissionService,
                this.logService,
                this.auditLogQueryService,
                this.fixedClock);
    }

    // ===================== USM-01 list =====================

    @Test
    @DisplayName("USM-01 list returns paged items mapped to AdminUserListItemResponse")
    void list_returnsMappedPage() {
        this.adminUserService = this.buildService();
        User u = this.user(1L, "a@test.com", "STAFF", GeneralStatus.ACTIVE);
        Position p = new Position();
        p.setPositionId(1L);
        p.setName("Engineer");
        u.getPositions().add(p);
        Page<User> page = new PageImpl<>(List.of(u), PageRequest.of(0, 20), 1);
        when(this.userRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        AdminUserFilterRequest filter = new AdminUserFilterRequest();
        PageResponse<AdminUserListItemResponse> result = this.adminUserService.list(filter, PageRequest.of(0, 20));

        assertEquals(1, result.getItems().size());
        assertEquals("a@test.com", result.getItems().get(0).getEmail());
        assertEquals("Engineer", result.getItems().get(0).getPositionName());
    }

    @Test
    @DisplayName("USM-01 page size above max is clamped to MAX_PAGE_SIZE")
    void list_clampsPageSize() {
        this.adminUserService = this.buildService();
        when(this.userRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 100), 0));

        AdminUserFilterRequest filter = new AdminUserFilterRequest();
        this.adminUserService.list(filter, PageRequest.of(0, 500));

        org.mockito.ArgumentCaptor<Pageable> captor = org.mockito.ArgumentCaptor.forClass(Pageable.class);
        verify(this.userRepository).findAll(any(Specification.class), captor.capture());
        assertEquals(100, captor.getValue().getPageSize());
    }

    // ===================== USM-03 lock / unlock =====================

    @Test
    @DisplayName("USM-03 updateStatus(LOCKED) locks the user and logs USER_LOCKED")
    void updateStatus_locksUser() {
        this.adminUserService = this.buildService();
        User target = this.user(7L, "t@test.com", "STAFF", GeneralStatus.ACTIVE);
        User admin = this.user(1L, "admin@test.com", "ADMIN", GeneralStatus.ACTIVE);
        when(this.userRepository.findById(7L)).thenReturn(Optional.of(target));
        when(this.permissionService.getCurrentUser()).thenReturn(admin);
        when(this.userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateUserStatusRequest req = new UpdateUserStatusRequest();
        req.setStatus("LOCKED");
        UserResponse res = this.adminUserService.updateStatus(7L, req);

        assertEquals(GeneralStatus.LOCKED, target.getStatus());
        assertEquals(GeneralStatus.LOCKED, res.getStatus());
        verify(this.logService).log(eq("USER_LOCKED"), eq("USER"), eq(7L), eq("status"), anyString(), eq("LOCKED"));
    }

    @Test
    @DisplayName("USM-03 updateStatus(ACTIVE) unlocks the user and logs USER_UNLOCKED")
    void updateStatus_unlocksUser() {
        this.adminUserService = this.buildService();
        User target = this.user(7L, "t@test.com", "STAFF", GeneralStatus.LOCKED);
        User admin = this.user(1L, "admin@test.com", "ADMIN", GeneralStatus.ACTIVE);
        when(this.userRepository.findById(7L)).thenReturn(Optional.of(target));
        when(this.permissionService.getCurrentUser()).thenReturn(admin);
        when(this.userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateUserStatusRequest req = new UpdateUserStatusRequest();
        req.setStatus("ACTIVE");
        this.adminUserService.updateStatus(7L, req);

        assertEquals(GeneralStatus.ACTIVE, target.getStatus());
        verify(this.logService).log(eq("USER_UNLOCKED"), eq("USER"), eq(7L), eq("status"), anyString(), eq("ACTIVE"));
    }

    @Test
    @DisplayName("USM-03 admin cannot lock self")
    void updateStatus_rejectsSelfLock() {
        this.adminUserService = this.buildService();
        User admin = this.user(1L, "admin@test.com", "ADMIN", GeneralStatus.ACTIVE);
        when(this.userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(this.permissionService.getCurrentUser()).thenReturn(admin);

        UpdateUserStatusRequest req = new UpdateUserStatusRequest();
        req.setStatus("LOCKED");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> this.adminUserService.updateStatus(1L, req));
        assertEquals("CANNOT_LOCK_SELF", ex.getMessage());
    }

    @Test
    @DisplayName("USM-03 unknown user yields 404 via ResourceNotFoundException")
    void updateStatus_unknownUser() {
        this.adminUserService = this.buildService();
        when(this.userRepository.findById(99L)).thenReturn(Optional.empty());

        UpdateUserStatusRequest req = new UpdateUserStatusRequest();
        req.setStatus("LOCKED");
        assertThrows(ResourceNotFoundException.class, () -> this.adminUserService.updateStatus(99L, req));
    }

    // ===================== USM-04 soft delete =====================

    @Test
    @DisplayName("USM-04 softDelete sets status=DELETED, deletedAt=now, closes team memberships")
    void softDelete_marksAndCascades() {
        this.adminUserService = this.buildService();
        User target = this.user(7L, "t@test.com", "STAFF", GeneralStatus.ACTIVE);
        User admin = this.user(1L, "admin@test.com", "ADMIN", GeneralStatus.ACTIVE);
        when(this.userRepository.findById(7L)).thenReturn(Optional.of(target));
        when(this.permissionService.getCurrentUser()).thenReturn(admin);
        TeamMember tm = new TeamMember();
        when(this.teamMemberRepository.findByUser_UserId(7L)).thenReturn(List.of(tm));

        this.adminUserService.softDelete(7L);

        assertEquals(GeneralStatus.DELETED, target.getStatus());
        assertNotNull(target.getDeletedAt());
        assertEquals(this.fixedNow, target.getDeletedAt());
        assertNotNull(tm.getLeftAt());
        verify(this.userRepository).save(target);
        verify(this.userRepository, never()).delete(any(User.class));
        verify(this.logService).log(eq("USER_DELETED"), eq("USER"), eq(7L), eq("status"), anyString(), eq("DELETED"));
    }

    @Test
    @DisplayName("USM-04 admin cannot delete self")
    void softDelete_rejectsSelfDelete() {
        this.adminUserService = this.buildService();
        User admin = this.user(1L, "admin@test.com", "ADMIN", GeneralStatus.ACTIVE);
        when(this.userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(this.permissionService.getCurrentUser()).thenReturn(admin);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> this.adminUserService.softDelete(1L));
        assertEquals("CANNOT_DELETE_SELF", ex.getMessage());
        verify(this.userRepository, never()).save(any(User.class));
    }

    // ===================== USM-02 activity =====================

    @Test
    @DisplayName("USM-02 findActivityForUser delegates to AuditLogQueryService with actorId filter")
    void findActivity_delegatesWithActorIdFilter() {
        this.adminUserService = this.buildService();
        when(this.userRepository.existsById(7L)).thenReturn(true);
        PageResponse<AuditLogResponse> expected = new PageResponse<>(List.of(), 0, 20, 0L, 0, false, false);
        when(this.auditLogQueryService.search(any(AuditLogFilterRequest.class), any(Pageable.class)))
                .thenReturn(expected);

        PageResponse<AuditLogResponse> result = this.adminUserService.findActivityForUser(7L, PageRequest.of(0, 20));

        org.mockito.ArgumentCaptor<AuditLogFilterRequest> filterCaptor =
                org.mockito.ArgumentCaptor.forClass(AuditLogFilterRequest.class);
        verify(this.auditLogQueryService).search(filterCaptor.capture(), any(Pageable.class));
        assertEquals(7L, filterCaptor.getValue().getActorId());
        assertEquals(expected, result);
    }

    @Test
    @DisplayName("USM-02 unknown user returns 404")
    void findActivity_unknownUser() {
        this.adminUserService = this.buildService();
        when(this.userRepository.existsById(99L)).thenReturn(false);
        assertThrows(ResourceNotFoundException.class,
                () -> this.adminUserService.findActivityForUser(99L, PageRequest.of(0, 20)));
    }

    // ===================== USM-05 create =====================

    @Test
    @DisplayName("USM-05 create delegates to UserService.create and returns its UserResponse")
    void create_delegates() {
        this.adminUserService = this.buildService();
        UserResponse resp = new UserResponse();
        resp.setUserId(99L);
        when(this.userService.create(any())).thenReturn(resp);

        UserResponse out = this.adminUserService.create(new com.das.skillmatrix.dto.request.CreateUserRequest());

        assertEquals(99L, out.getUserId());
    }
}
