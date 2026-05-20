package com.das.skillmatrix.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.das.skillmatrix.config.JwtAuthenticationFilter;
import com.das.skillmatrix.dto.request.PositionCreateRequest;
import com.das.skillmatrix.dto.request.RequiredSkillEntry;
import com.das.skillmatrix.dto.response.PageResponse;
import com.das.skillmatrix.dto.response.PositionDetailResponse;
import com.das.skillmatrix.entity.GeneralStatus;
import com.das.skillmatrix.exception.GlobalExceptionHandler;
import com.das.skillmatrix.security.JwtUtil;
import com.das.skillmatrix.service.CustomUserDetailsService;
import com.das.skillmatrix.service.PositionService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = PositionController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@WithMockUser(roles = "ADMIN")
class PositionControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    PositionService positionService;

    @MockBean
    JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    JwtUtil jwtUtil;

    @MockBean
    CustomUserDetailsService customUserDetailsService;

    private PositionDetailResponse position(Long id, String name) {
        return PositionDetailResponse.builder()
                .positionId(id)
                .name(name)
                .status(GeneralStatus.ACTIVE)
                .requiredSkills(List.of())
                .build();
    }

    @Test
    @DisplayName("GET /api/admin/positions returns 200 with paged result")
    void list_returnsPage() throws Exception {
        PageResponse<PositionDetailResponse> page = new PageResponse<>(
                List.of(position(1L, "Backend")), 0, 20, 1L, 1, false, false);
        when(positionService.list(any(), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/admin/positions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[0].name").value("Backend"));
    }

    @Test
    @DisplayName("POST /api/admin/positions returns 201")
    void create_returns201() throws Exception {
        PositionCreateRequest request = new PositionCreateRequest(
                "Backend", "desc", List.of(new RequiredSkillEntry(11L, 3)));
        when(positionService.create(any(PositionCreateRequest.class)))
                .thenReturn(position(1L, "Backend"));

        mockMvc.perform(post("/api/admin/positions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Backend"));
    }

    @Test
    @DisplayName("POST /api/admin/positions returns 400 when name blank")
    void create_returns400OnBlankName() throws Exception {
        PositionCreateRequest request = new PositionCreateRequest("", null, List.of());

        mockMvc.perform(post("/api/admin/positions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/admin/positions/{id} returns 200")
    void update_returns200() throws Exception {
        when(positionService.update(eq(1L), any())).thenReturn(position(1L, "Pro"));

        mockMvc.perform(put("/api/admin/positions/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new PositionCreateRequest("Pro", null, List.of()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Pro"));
    }

    @Test
    @DisplayName("DELETE /api/admin/positions/{id} returns 200")
    void delete_returns200() throws Exception {
        doNothing().when(positionService).delete(1L);

        mockMvc.perform(delete("/api/admin/positions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
