package com.spendwise.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardResponse {
    private double totalIncome;
    private double totalExpense;
    private double remainingBalance;
    private double totalSavings;
    private double budgetUtilization;
    private int financialHealthScore;
    private List<BudgetResponse> budgetUtilizationList;
    private List<TransactionResponse> recentTransactions;
    private List<ChartDataPoint> expenseByCategory;
    private List<ChartDataPoint> incomeVsExpense;
    private List<ChartDataPoint> monthlyTrend;

    @Data
    @Builder
    public static class ChartDataPoint {
        private String label;
        private double value;
        private String color;
    }
}
