package com.spendwise.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BudgetResponse {
    private Long id;
    private String category;
    private int month;
    private int year;
    private Double budgetAmount;
    private Double spentAmount;
    private Double remainingAmount;
    private double utilizationPercent;
    private Double alertThreshold;
    private boolean isOverBudget;
    private boolean isAlertTriggered;
}
