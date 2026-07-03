package com.spendwise.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class ReportResponse {
    private String period;
    private int year;
    private int month;
    private double totalIncome;
    private double totalExpense;
    private double netSavings;
    private double savingsRate;
    private Map<String, Double> categoryBreakdown;
    private List<ChartDataPoint> dailyTrend;
    private List<ChartDataPoint> categoryChart;
    private String mostSpendingCategory;
    private double averageDailyExpense;
    private int transactionCount;

    @Data
    @Builder
    public static class ChartDataPoint {
        private String label;
        private double value;
        private String color;
    }
}
