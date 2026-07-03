package com.spendwise.service;

import com.spendwise.dto.request.BudgetRequest;
import com.spendwise.dto.response.BudgetResponse;

import java.util.List;

public interface BudgetService {
    BudgetResponse createBudget(Long userId, BudgetRequest request);
    BudgetResponse updateBudget(Long userId, Long budgetId, BudgetRequest request);
    void deleteBudget(Long userId, Long budgetId);
    BudgetResponse getBudget(Long userId, Long budgetId);
    List<BudgetResponse> getUserBudgetsForMonth(Long userId, int month, int year);
    List<BudgetResponse> getAllUserBudgets(Long userId);
    void refreshBudgetSpent(Long userId, int month, int year);
}
