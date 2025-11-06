package com.lotto.userservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "prediction_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prediction_id")
    private Long predictionId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "predicted_numbers", nullable = false, length = 50)
    private String predictedNumbers; // "1,5,12,23,34,45" 형태로 저장
    
    @Column(nullable = false, length = 20)
    private String method;
    
    @Column
    private Double confidence;
    
    @Column(name = "matched_numbers")
    private Integer matchedNumbers;
    
    @Column(name = "target_round")
    private Integer targetRound;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
