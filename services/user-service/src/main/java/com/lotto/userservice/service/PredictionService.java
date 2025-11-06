package com.lotto.userservice.service;

import com.lotto.userservice.entity.PredictionHistory;
import com.lotto.userservice.entity.User;
import com.lotto.userservice.repository.PredictionHistoryRepository;
import com.lotto.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PredictionService {
    
    private final PredictionHistoryRepository predictionHistoryRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public PredictionHistory savePrediction(String username, PredictionHistory prediction) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        prediction.setUser(user);
        return predictionHistoryRepository.save(prediction);
    }
    
    @Transactional(readOnly = true)
    public List<PredictionHistory> getUserPredictions(String username, int limit) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (limit > 0) {
            return predictionHistoryRepository.findTop10ByUserOrderByCreatedAtDesc(user);
        } else {
            PageRequest pageRequest = PageRequest.of(0, 50); // 최대 50개
            Page<PredictionHistory> page = predictionHistoryRepository.findByUserOrderByCreatedAtDesc(user, pageRequest);
            return page.getContent();
        }
    }
    
    @Transactional(readOnly = true)
    public Long getUserPredictionCount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return predictionHistoryRepository.countByUser(user);
    }
    
    @Transactional
    public void deletePrediction(String username, Long predictionId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        PredictionHistory prediction = predictionHistoryRepository.findById(predictionId)
                .orElseThrow(() -> new RuntimeException("Prediction not found"));
        
        if (!prediction.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        predictionHistoryRepository.delete(prediction);
    }
}
