package com.das.skillmatrix.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.das.skillmatrix.constants.ConfigConstants;
import com.das.skillmatrix.dto.request.UpdateRatingScaleRequest;
import com.das.skillmatrix.dto.request.UpdateRatingScaleRequest.RatingScaleEntry;
import com.das.skillmatrix.dto.response.RatingScaleResponse;
import com.das.skillmatrix.entity.RatingScale;
import com.das.skillmatrix.repository.RatingScaleRepository;

@ExtendWith(MockitoExtension.class)
class RatingScaleServiceTest {

    @Mock
    private RatingScaleRepository ratingScaleRepository;

    @InjectMocks
    private RatingScaleService ratingScaleService;

    private RatingScale build(int level, String label) {
        RatingScale r = new RatingScale();
        r.setLevel(level);
        r.setLabel(label);
        return r;
    }

    @Test
    @DisplayName("getAll() seeds defaults when no rows exist")
    void getAll_seedsWhenEmpty() {
        when(ratingScaleRepository.findAllByOrderByLevelAsc())
                .thenReturn(List.of())
                .thenReturn(List.of(
                        build(1, "Beginner"),
                        build(2, "Basic"),
                        build(3, "Intermediate"),
                        build(4, "Advanced"),
                        build(5, "Expert")));
        when(ratingScaleRepository.save(any(RatingScale.class))).thenAnswer(inv -> inv.getArgument(0));

        RatingScaleResponse response = ratingScaleService.getAll();

        assertEquals(5, response.getItems().size());
    }

    @Test
    @DisplayName("update() requires exactly 5 levels")
    void update_rejectsWrongSize() {
        UpdateRatingScaleRequest request = new UpdateRatingScaleRequest(
                List.of(new RatingScaleEntry(1, "Beginner", null)));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> ratingScaleService.update(request));
        assertEquals(ConfigConstants.MSG_RATING_INVALID_LEVELS, ex.getMessage());
    }

    @Test
    @DisplayName("update() rejects duplicate level")
    void update_rejectsDuplicateLevel() {
        UpdateRatingScaleRequest request = new UpdateRatingScaleRequest(List.of(
                new RatingScaleEntry(1, "A", null),
                new RatingScaleEntry(1, "B", null),
                new RatingScaleEntry(3, "C", null),
                new RatingScaleEntry(4, "D", null),
                new RatingScaleEntry(5, "E", null)));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> ratingScaleService.update(request));
        assertEquals(ConfigConstants.MSG_RATING_DUPLICATE_LEVEL, ex.getMessage());
    }

    @Test
    @DisplayName("update() upserts each level")
    void update_upsertsEach() {
        UpdateRatingScaleRequest request = new UpdateRatingScaleRequest(List.of(
                new RatingScaleEntry(1, "Junior", null),
                new RatingScaleEntry(2, "Basic", null),
                new RatingScaleEntry(3, "Mid", null),
                new RatingScaleEntry(4, "Senior", null),
                new RatingScaleEntry(5, "Lead", null)));

        when(ratingScaleRepository.findByLevel(any(Integer.class))).thenReturn(Optional.empty());
        when(ratingScaleRepository.save(any(RatingScale.class))).thenAnswer(inv -> inv.getArgument(0));
        when(ratingScaleRepository.findAllByOrderByLevelAsc())
                .thenReturn(List.of(
                        build(1, "Junior"),
                        build(2, "Basic"),
                        build(3, "Mid"),
                        build(4, "Senior"),
                        build(5, "Lead")));

        RatingScaleResponse response = ratingScaleService.update(request);

        assertEquals(5, response.getItems().size());
        assertEquals("Junior", response.getItems().get(0).getLabel());
    }
}
