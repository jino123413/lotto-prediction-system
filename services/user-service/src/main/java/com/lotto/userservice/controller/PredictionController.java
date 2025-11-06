package com.lotto.userservice.controller;

import com.lotto.userservice.entity.PredictionHistory;
import com.lotto.userservice.service.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PredictionController {
    
    private final PredictionService predictionService;
    
    @PostMapping
    public ResponseEntity<?> savePrediction(
            @RequestHeader(value = "username", required = false, defaultValue = "guest") String username,
            @RequestBody PredictionHistory prediction) {
        try {
            PredictionHistory saved = predictionService.savePrediction(username, prediction);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getPredictions(
            @RequestHeader(value = "username", required = false, defaultValue = "guest") String username,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<PredictionHistory> predictions = predictionService.getUserPredictions(username, limit);
            return ResponseEntity.ok(predictions);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/count")
    public ResponseEntity<?> getCount(@RequestHeader(value = "username", required = false, defaultValue = "guest") String username) {
        try {
            Long count = predictionService.getUserPredictionCount(username);
            return ResponseEntity.ok().body("{\"count\": " + count + "}");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePrediction(
            @RequestHeader(value = "username", required = false, defaultValue = "guest") String username,
            @PathVariable Long id) {
        try {
            predictionService.deletePrediction(username, id);
            return ResponseEntity.ok().body("Prediction deleted");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
