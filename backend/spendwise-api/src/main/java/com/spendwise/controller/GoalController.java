package com.spendwise.controller;

import com.spendwise.dto.request.GoalRequest;
import com.spendwise.dto.response.GoalResponse;
import com.spendwise.security.UserPrincipal;
import com.spendwise.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @PostMapping
    public ResponseEntity<GoalResponse> createGoal(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody GoalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(goalService.createGoal(principal.getId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalResponse> updateGoal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody GoalRequest request) {
        return ResponseEntity.ok(
            goalService.updateGoal(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        goalService.deleteGoal(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<GoalResponse>> getUserGoals(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(goalService.getUserGoals(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalResponse> getGoal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(goalService.getGoal(principal.getId(), id));
    }

    @PostMapping("/{id}/progress")
    public ResponseEntity<GoalResponse> addProgress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody Map<String, Double> request) {
        return ResponseEntity.ok(
            goalService.addGoalProgress(principal.getId(), id, request.get("amount")));
    }
}
