package com.das.skillmatrix.service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.das.skillmatrix.constants.ConfigConstants;
import com.das.skillmatrix.dto.request.UpdateRatingScaleRequest;
import com.das.skillmatrix.dto.request.UpdateRatingScaleRequest.RatingScaleEntry;
import com.das.skillmatrix.dto.response.RatingScaleResponse;
import com.das.skillmatrix.dto.response.RatingScaleResponse.RatingScaleItem;
import com.das.skillmatrix.entity.RatingScale;
import com.das.skillmatrix.repository.RatingScaleRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class RatingScaleService {

    private final RatingScaleRepository ratingScaleRepository;

    @Transactional(readOnly = true)
    public RatingScaleResponse getAll() {
        List<RatingScale> existing = this.ratingScaleRepository.findAllByOrderByLevelAsc();
        if (existing.isEmpty()) {
            existing = this.seedDefaults();
        }
        return this.toResponse(existing);
    }

    public RatingScaleResponse update(UpdateRatingScaleRequest request) {
        this.validateEntries(request.getItems());
        for (RatingScaleEntry entry : request.getItems()) {
            RatingScale scale = this.ratingScaleRepository.findByLevel(entry.getLevel())
                    .orElseGet(RatingScale::new);
            scale.setLevel(entry.getLevel());
            scale.setLabel(entry.getLabel().trim());
            scale.setDescription(entry.getDescription());
            this.ratingScaleRepository.save(scale);
        }
        return this.getAll();
    }

    private void validateEntries(List<RatingScaleEntry> items) {
        if (items == null || items.size() != ConfigConstants.RATING_LEVEL_MAX) {
            throw new IllegalArgumentException(ConfigConstants.MSG_RATING_INVALID_LEVELS);
        }
        Set<Integer> seenLevels = new HashSet<>();
        for (RatingScaleEntry item : items) {
            if (item.getLevel() == null
                    || item.getLevel() < ConfigConstants.RATING_LEVEL_MIN
                    || item.getLevel() > ConfigConstants.RATING_LEVEL_MAX) {
                throw new IllegalArgumentException(ConfigConstants.MSG_RATING_INVALID_LEVELS);
            }
            if (!seenLevels.add(item.getLevel())) {
                throw new IllegalArgumentException(ConfigConstants.MSG_RATING_DUPLICATE_LEVEL);
            }
            if (item.getLabel() == null || item.getLabel().trim().isEmpty()) {
                throw new IllegalArgumentException(ConfigConstants.MSG_RATING_LABEL_REQUIRED);
            }
        }
    }

    private List<RatingScale> seedDefaults() {
        for (Map.Entry<Integer, String> entry : ConfigConstants.DEFAULT_RATING_LABELS.entrySet()) {
            RatingScale scale = new RatingScale();
            scale.setLevel(entry.getKey());
            scale.setLabel(entry.getValue());
            scale.setDescription(null);
            this.ratingScaleRepository.save(scale);
        }
        return this.ratingScaleRepository.findAllByOrderByLevelAsc();
    }

    private RatingScaleResponse toResponse(List<RatingScale> scales) {
        List<RatingScaleItem> items = scales.stream()
                .map(s -> RatingScaleItem.builder()
                        .level(s.getLevel())
                        .label(s.getLabel())
                        .description(s.getDescription())
                        .build())
                .collect(Collectors.toList());
        return RatingScaleResponse.builder().items(items).build();
    }
}
