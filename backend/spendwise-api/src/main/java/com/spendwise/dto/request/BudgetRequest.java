package com.spendwise.dto.request;

import com.spendwise.enums.ExpenseCategory;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class BudgetRequest {
    @NotNull(message = "Category is required")
    private ExpenseCategory category;

    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    private int month;

    @Min(value = 2024, message = "Invalid year")
    private int year;

    @NotNull(message = "Budget amount is required")
    @Positive(message = "Budget amount must be positive")
    private Double budgetAmount;

    private Double alertThreshold;
}
