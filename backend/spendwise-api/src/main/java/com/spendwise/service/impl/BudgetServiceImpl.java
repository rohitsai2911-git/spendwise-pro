package com.spendwise.service.impl;

import com.spendwise.dto.request.BudgetRequest;
import com.spendwise.dto.response.BudgetResponse;
import com.spendwise.entity.Budget;
import com.spendwise.entity.User;
import com.spendwise.exception.BadRequestException;
import com.spendwise.exception.DuplicateResourceException;
import com.spendwise.exception.ResourceNotFoundException;
import com.spendwise.exception.UnauthorizedException;
import com.spendwise.repository.BudgetRepository;
import com.spendwise.repository.TransactionRepository;
import com.spendwise.repository.UserRepository;
import com.spendwise.service.BudgetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public BudgetResponse createBudget(Long userId, BudgetRequest request) {
        userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (budgetRepository.existsByUserIdAndCategoryAndMonthAndYear(
                userId, request.getCategory(), request.getMonth(), request.getYear())) {
            throw new DuplicateResourceException(
                "Budget already exists for this category in " + request.getMonth() + "/" + request.getYear());
        }

        Budget budget = Budget.builder()
            .user(User.builder().id(userId).build())
            .category(request.getCategory())
            .month(request.getMonth())
            .year(request.getYear())
            .budgetAmount(request.getBudgetAmount())
            .spentAmount(0.0)
            .alertThreshold(request.getAlertThreshold() != null ? request.getAlertThreshold() : 80.0)
            .build();

        budget = budgetRepository.save(budget);
        refreshBudgetSpent(userId, request.getMonth(), request.getYear());
        budget = budgetRepository.findById(budget.getId()).orElse(budget);

        log.info("Budget created for user {}: {} {} {}/{}",
            userId, request.getCategory(), request.getBudgetAmount(), request.getMonth(), request.getYear());

        return toResponse(budget);
    }

    @Override
    @Transactional
    public BudgetResponse updateBudget(Long userId, Long budgetId, BudgetRequest request) {
        Budget budget = budgetRepository.findById(budgetId)
            .orElseThrow(() -> new ResourceNotFoundException("Budget", budgetId));

        if (!budget.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You cannot modify this budget");
        }

        budget.setBudgetAmount(request.getBudgetAmount());
        budget.setAlertThreshold(request.getAlertThreshold());

        if (request.getMonth() != budget.getMonth() || request.getYear() != budget.getYear()) {
            budget.setMonth(request.getMonth());
            budget.setYear(request.getYear());
        }

        budget = budgetRepository.save(budget);
        refreshBudgetSpent(userId, budget.getMonth(), budget.getYear());
        budget = budgetRepository.findById(budget.getId()).orElse(budget);

        return toResponse(budget);
    }

    @Override
    @Transactional
    public void deleteBudget(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
            .orElseThrow(() -> new ResourceNotFoundException("Budget", budgetId));

        if (!budget.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You cannot delete this budget");
        }

        budgetRepository.delete(budget);
        log.info("Budget deleted: {}", budgetId);
    }

    @Override
    public BudgetResponse getBudget(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
            .orElseThrow(() -> new ResourceNotFoundException("Budget", budgetId));

        if (!budget.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You cannot view this budget");
        }

        return toResponse(budget);
    }

    @Override
    public List<BudgetResponse> getUserBudgetsForMonth(Long userId, int month, int year) {
        refreshBudgetSpent(userId, month, year);
        return budgetRepository.findByUserIdAndMonthAndYear(userId, month, year)
            .stream().map(this::toResponse).toList();
    }

    @Override
    public List<BudgetResponse> getAllUserBudgets(Long userId) {
        return budgetRepository.findByUserId(userId)
            .stream().map(this::toResponse).toList();
    }

    @Override
    public void refreshBudgetSpent(Long userId, int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        var budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
        for (Budget budget : budgets) {
            double spent = transactionRepository.sumByCategoryAndUserBetweenDates(
                userId, budget.getCategory(), start, end);
            budget.setSpentAmount(spent);
            budgetRepository.save(budget);
        }
    }

    private BudgetResponse toResponse(Budget budget) {
        boolean isOverBudget = budget.getSpentAmount() > budget.getBudgetAmount();
        double utilizationPercent = budget.getBudgetAmount() > 0
            ? (budget.getSpentAmount() / budget.getBudgetAmount()) * 100 : 0;
        boolean isAlertTriggered = budget.getAlertThreshold() != null
            && utilizationPercent >= budget.getAlertThreshold();

        return BudgetResponse.builder()
            .id(budget.getId())
            .category(budget.getCategory().name())
            .month(budget.getMonth())
            .year(budget.getYear())
            .budgetAmount(budget.getBudgetAmount())
            .spentAmount(budget.getSpentAmount())
            .remainingAmount(budget.getBudgetAmount() - budget.getSpentAmount())
            .utilizationPercent(Math.min(utilizationPercent, 100))
            .alertThreshold(budget.getAlertThreshold())
            .isOverBudget(isOverBudget)
            .isAlertTriggered(isAlertTriggered)
            .build();
    }
}
