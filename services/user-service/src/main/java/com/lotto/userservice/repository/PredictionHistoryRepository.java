package com.lotto.userservice.repository;

import com.lotto.userservice.entity.PredictionHistory;
import com.lotto.userservice.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PredictionHistoryRepository extends JpaRepository<PredictionHistory, Long> {
    Page<PredictionHistory> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    List<PredictionHistory> findTop10ByUserOrderByCreatedAtDesc(User user);
    Long countByUser(User user);
}
