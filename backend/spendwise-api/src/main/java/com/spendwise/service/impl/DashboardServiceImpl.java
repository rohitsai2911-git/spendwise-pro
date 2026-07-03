package com.spendwise.service.impl;

import com.spendwise.dto.response.BudgetResponse;
import com.spendwise.dto.response.DashboardResponse;
import com.spendwise.dto.response.TransactionResponse;
import com.spendwise.entity.Goal;
import com.spendwise.entity.Transaction;
import com.spendwise.enums.ExpenseCategory;
import com.spendwise.enums.GoalStatus;
import com.spendwise.enums.TransactionType;
import com.spendwise.exception.ResourceNotFoundException;
import com.spendwise.repository.*;
import com.spendwise.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final GoalRepository goalRepository;

    private static final List<String> COLORS = List.of(
        "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
        "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16"
    );

    @Override
    public DashboardResponse getDashboard(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", userId);
        }

        LocalDate now = LocalDate.now();
        LocalDate monthStart = now.withDayOfMonth(1);
        LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());
        LocalDate yearStart = now.withDayOfYear(1);

        double totalIncome = transactionRepository.sumByUserIdAndTypeBetweenDates(
            userId, TransactionType.INCOME, monthStart, monthEnd);
        double totalExpense = transactionRepository.sumByUserIdAndTypeBetweenDates(
            userId, TransactionType.EXPENSE, monthStart, monthEnd);
        double remainingBalance = totalIncome - totalExpense;

        double totalIncomeYear = transactionRepository.sumByUserIdAndTypeBetweenDates(
            userId, TransactionType.INCOME, yearStart, monthEnd);
        double totalExpenseYear = transactionRepository.sumByUserIdAndTypeBetweenDates(
            userId, TransactionType.EXPENSE, yearStart, monthEnd);
        double totalSavings = totalIncomeYear - totalExpenseYear;

        var budgets = budgetRepository.findByUserIdAndMonthAndYear(
            userId, now.getMonthValue(), now.getYear());
        double totalBudgetAmount = budgets.stream().mapToDouble(b -> b.getBudgetAmount()).sum();
        double totalSpentAmount = budgets.stream().mapToDouble(b -> b.getSpentAmount()).sum();
        double budgetUtil = totalBudgetAmount > 0 ? (totalSpentAmount / totalBudgetAmount) * 100 : 0;

        long completedGoals = goalRepository.countByUserIdAndStatus(userId, GoalStatus.COMPLETED);
        int healthScore = calculateHealthScore(totalIncome, totalExpense, totalSavings, completedGoals);

        var recentTxns = transactionRepository
            .findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(userId, monthStart, monthEnd)
            .stream().limit(10).map(this::toTxnResponse).toList();

        var expenseByCat = getExpenseByCategory(userId, monthStart, monthEnd);
        var incomeVsExpense = getIncomeVsExpense(userId, yearStart, monthEnd);
        var monthlyTrend = getMonthlyTrend(userId, yearStart, monthEnd);

        return DashboardResponse.builder()
            .totalIncome(totalIncome)
            .totalExpense(totalExpense)
            .remainingBalance(Math.max(remainingBalance, 0))
            .totalSavings(Math.max(totalSavings, 0))
            .budgetUtilization(Math.min(budgetUtil, 100))
            .financialHealthScore(healthScore)
            .budgetUtilizationList(budgets.stream().map(b -> BudgetResponse.builder()
                .id(b.getId())
                .category(b.getCategory().name())
                .budgetAmount(b.getBudgetAmount())
                .spentAmount(b.getSpentAmount())
                .remainingAmount(b.getBudgetAmount() - b.getSpentAmount())
                .utilizationPercent(b.getBudgetAmount() > 0
                    ? (b.getSpentAmount() / b.getBudgetAmount()) * 100 : 0)
                .build()).toList())
            .recentTransactions(recentTxns)
            .expenseByCategory(expenseByCat)
            .incomeVsExpense(incomeVsExpense)
            .monthlyTrend(monthlyTrend)
            .build();
    }

    private int calculateHealthScore(double income, double expense, double savings, long goals) {
        int score = 50;
        if (income > 0) {
            double savingsRate = (income - expense) / income * 100;
            if (savingsRate >= 30) score += 25;
            else if (savingsRate >= 20) score += 20;
            else if (savingsRate >= 10) score += 10;
        }
        if (expense <= income) score += 15;
        if (goals > 0) score += 10;
        return Math.min(score, 100);
    }

    private List<DashboardResponse.ChartDataPoint> getExpenseByCategory(Long userId, LocalDate start, LocalDate end) {
        List<Object[]> results = transactionRepository.sumByCategoryBetweenDates(userId, start, end);
        double totalSpent = results.stream().mapToDouble(r -> (Double) r[1]).sum();

        if (totalSpent == 0) return List.of();

        List<DashboardResponse.ChartDataPoint> points = new ArrayList<>();
        int colorIdx = 0;
        for (Object[] row : results) {
            ExpenseCategory cat = (ExpenseCategory) row[0];
            double amount = (Double) row[1];
            if (amount > 0) {
                points.add(DashboardResponse.ChartDataPoint.builder()
                    .label(cat != null ? cat.name() : "OTHER")
                    .value(Math.round(amount * 100.0) / 100.0)
                    .color(COLORS.get(colorIdx % COLORS.size()))
                    .build());
                colorIdx++;
            }
        }
        return points;
    }

    private List<DashboardResponse.ChartDataPoint> getIncomeVsExpense(Long userId, LocalDate start, LocalDate end) {
        double income = transactionRepository.sumByUserIdAndTypeBetweenDates(
            userId, TransactionType.INCOME, start, end);
        double expense = transactionRepository.sumByUserIdAndTypeBetweenDates(
            userId, TransactionType.EXPENSE, start, end);

        return List.of(
            DashboardResponse.ChartDataPoint.builder().label("Income").value(Math.round(income * 100.0) / 100.0).color("#10B981").build(),
            DashboardResponse.ChartDataPoint.builder().label("Expense").value(Math.round(expense * 100.0) / 100.0).color("#EF4444").build()
        );
    }

    private List<DashboardResponse.ChartDataPoint> getMonthlyTrend(Long userId, LocalDate start, LocalDate end) {
        List<Object[]> incomeData = transactionRepository.monthlyTotalsByType(
            userId, TransactionType.INCOME, start.withDayOfMonth(1));
        List<Object[]> expenseData = transactionRepository.monthlyTotalsByType(
            userId, TransactionType.EXPENSE, start.withDayOfMonth(1));

        Map<String, Double> incomeMap = new HashMap<>();
        Map<String, Double> expenseMap = new HashMap<>();

        for (Object[] row : incomeData) {
            String key = row[0] + "/" + row[1];
            incomeMap.put(key, (Double) row[2]);
        }
        for (Object[] row : expenseData) {
            String key = row[0] + "/" + row[1];
            expenseMap.put(key, (Double) row[2]);
        }

        Set<String> allKeys = new LinkedHashSet<>(incomeMap.keySet());
        allKeys.addAll(expenseMap.keySet());

        return allKeys.stream().map(key -> {
            double net = incomeMap.getOrDefault(key, 0.0) - expenseMap.getOrDefault(key, 0.0);
            return DashboardResponse.ChartDataPoint.builder()
                .label(key)
                .value(Math.round(net * 100.0) / 100.0)
                .color(net >= 0 ? "#10B981" : "#EF4444")
                .build();
        }).toList();
    }

    private TransactionResponse toTxnResponse(Transaction t) {
        return TransactionResponse.builder()
            .id(t.getId())
            .type(t.getType().name())
            .amount(t.getAmount())
            .description(t.getDescription())
            .transactionDate(t.getTransactionDate())
            .expenseCategory(t.getExpenseCategory() != null ? t.getExpenseCategory().name() : null)
            .incomeSource(t.getIncomeSource() != null ? t.getIncomeSource().name() : null)
            .paymentMethod(t.getPaymentMethod() != null ? t.getPaymentMethod().name() : null)
            .createdAt(t.getCreatedAt())
            .build();
    }
}
