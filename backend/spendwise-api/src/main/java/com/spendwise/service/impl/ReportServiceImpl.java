package com.spendwise.service.impl;

import com.spendwise.dto.response.ReportResponse;
import com.spendwise.enums.TransactionType;
import com.spendwise.exception.ResourceNotFoundException;
import com.spendwise.repository.TransactionRepository;
import com.spendwise.repository.UserRepository;
import com.spendwise.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    private static final List<String> COLORS = List.of(
        "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
        "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16",
        "#E11D48", "#0EA5E9", "#D946EF", "#22C55E"
    );

    @Override
    public ReportResponse getDailyReport(Long userId, int year, int month, int day) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", userId);
        }

        LocalDate date = LocalDate.of(year, month, day);
        var transactions = transactionRepository
            .findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(userId, date, date);

        double totalIncome = transactions.stream()
            .filter(t -> t.getType() == TransactionType.INCOME)
            .mapToDouble(t -> t.getAmount()).sum();
        double totalExpense = transactions.stream()
            .filter(t -> t.getType() == TransactionType.EXPENSE)
            .mapToDouble(t -> t.getAmount()).sum();

        Map<String, Double> categoryBreakdown = transactions.stream()
            .filter(t -> t.getType() == TransactionType.EXPENSE && t.getExpenseCategory() != null)
            .collect(Collectors.groupingBy(
                t -> t.getExpenseCategory().name(),
                Collectors.summingDouble(t -> t.getAmount())));

        String topCategory = categoryBreakdown.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("N/A");

        return buildReport("DAILY", year, month, date.getDayOfMonth(),
            totalIncome, totalExpense, categoryBreakdown, topCategory, transactions.size());
    }

    @Override
    public ReportResponse getWeeklyReport(Long userId, int year, int month, int day) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", userId);
        }

        LocalDate date = LocalDate.of(year, month, day);
        LocalDate weekStart = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(6);

        var transactions = transactionRepository
            .findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(userId, weekStart, weekEnd);

        double totalIncome = transactions.stream()
            .filter(t -> t.getType() == TransactionType.INCOME)
            .mapToDouble(t -> t.getAmount()).sum();
        double totalExpense = transactions.stream()
            .filter(t -> t.getType() == TransactionType.EXPENSE)
            .mapToDouble(t -> t.getAmount()).sum();

        Map<String, Double> categoryBreakdown = transactions.stream()
            .filter(t -> t.getType() == TransactionType.EXPENSE && t.getExpenseCategory() != null)
            .collect(Collectors.groupingBy(
                t -> t.getExpenseCategory().name(),
                Collectors.summingDouble(t -> t.getAmount())));

        String topCategory = categoryBreakdown.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("N/A");

        return buildReport("WEEKLY", year, month, weekStart.getDayOfMonth(),
            totalIncome, totalExpense, categoryBreakdown, topCategory, transactions.size());
    }

    @Override
    public ReportResponse getMonthlyReport(Long userId, int year, int month) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", userId);
        }

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        var transactions = transactionRepository
            .findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(userId, start, end);

        double totalIncome = transactions.stream()
            .filter(t -> t.getType() == TransactionType.INCOME)
            .mapToDouble(t -> t.getAmount()).sum();
        double totalExpense = transactions.stream()
            .filter(t -> t.getType() == TransactionType.EXPENSE)
            .mapToDouble(t -> t.getAmount()).sum();

        Map<String, Double> categoryBreakdown = transactions.stream()
            .filter(t -> t.getType() == TransactionType.EXPENSE && t.getExpenseCategory() != null)
            .collect(Collectors.groupingBy(
                t -> t.getExpenseCategory().name(),
                Collectors.summingDouble(t -> t.getAmount())));

        String topCategory = categoryBreakdown.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("N/A");

        return buildReport("MONTHLY", year, month, null,
            totalIncome, totalExpense, categoryBreakdown, topCategory, transactions.size());
    }

    @Override
    public ReportResponse getYearlyReport(Long userId, int year) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", userId);
        }

        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);

        var transactions = transactionRepository
            .findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(userId, start, end);

        double totalIncome = transactions.stream()
            .filter(t -> t.getType() == TransactionType.INCOME)
            .mapToDouble(t -> t.getAmount()).sum();
        double totalExpense = transactions.stream()
            .filter(t -> t.getType() == TransactionType.EXPENSE)
            .mapToDouble(t -> t.getAmount()).sum();

        Map<String, Double> categoryBreakdown = transactions.stream()
            .filter(t -> t.getType() == TransactionType.EXPENSE && t.getExpenseCategory() != null)
            .collect(Collectors.groupingBy(
                t -> t.getExpenseCategory().name(),
                Collectors.summingDouble(t -> t.getAmount())));

        String topCategory = categoryBreakdown.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("N/A");

        return buildReport("YEARLY", year, null, null,
            totalIncome, totalExpense, categoryBreakdown, topCategory, transactions.size());
    }

    @Override
    public ByteArrayOutputStream downloadReportPdf(Long userId, String period, int year, int month, Integer day) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        return baos;
    }

    private ReportResponse buildReport(String period, int year, Integer month, Integer day,
                                        double income, double expense,
                                        Map<String, Double> categoryBreakdown,
                                        String topCategory, int txnCount) {
        double netSavings = income - expense;
        double savingsRate = income > 0 ? (netSavings / income) * 100 : 0;
        double avgDailyExpense = expense > 0 && month != null
            ? expense / LocalDate.of(year, month, 1).lengthOfMonth() : 0;

        int daysInPeriod = month != null
            ? (day != null ? 1 : LocalDate.of(year, month, 1).lengthOfMonth())
            : 365;
        avgDailyExpense = expense > 0 ? expense / daysInPeriod : 0;

        var entries = new ArrayList<>(categoryBreakdown.entrySet());
        List<ReportResponse.ChartDataPoint> categoryChart = new java.util.ArrayList<>();
        for (int i = 0; i < entries.size(); i++) {
            var e = entries.get(i);
            categoryChart.add(ReportResponse.ChartDataPoint.builder()
                .label(e.getKey())
                .value(e.getValue())
                .color(COLORS.get(i % COLORS.size()))
                .build());
        }

        return ReportResponse.builder()
            .period(period)
            .year(year)
            .month(month != null ? month : 0)
            .totalIncome(Math.round(income * 100.0) / 100.0)
            .totalExpense(Math.round(expense * 100.0) / 100.0)
            .netSavings(Math.round(netSavings * 100.0) / 100.0)
            .savingsRate(Math.round(savingsRate * 100.0) / 100.0)
            .categoryBreakdown(categoryBreakdown)
            .categoryChart(categoryChart)
            .mostSpendingCategory(topCategory)
            .averageDailyExpense(Math.round(avgDailyExpense * 100.0) / 100.0)
            .transactionCount(txnCount)
            .build();
    }
}
