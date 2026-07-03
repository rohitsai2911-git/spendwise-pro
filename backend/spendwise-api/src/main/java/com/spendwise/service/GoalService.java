package com.spendwise.service;

import com.spendwise.dto.request.GoalRequest;
import com.spendwise.dto.response.GoalResponse;

import java.util.List;

public interface GoalService {
    GoalResponse createGoal(Long userId, GoalRequest request);
    GoalResponse updateGoal(Long userId, Long goalId, GoalRequest request);
    void deleteGoal(Long userId, Long goalId);
    GoalResponse getGoal(Long userId, Long goalId);
    List<GoalResponse> getUserGoals(Long userId);
    GoalResponse addGoalProgress(Long userId, Long goalId, Double amount);
}
