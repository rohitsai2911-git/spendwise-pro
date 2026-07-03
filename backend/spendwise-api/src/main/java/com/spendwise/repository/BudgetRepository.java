package com.spendwise.repository;

import com.spendwise.entity.Budget;
import com.spendwise.enums.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByUserIdAndCategoryAndMonthAndYear(
        Long userId, ExpenseCategory category, int month, int year);

    List<Budget> findByUserIdAndMonthAndYear(Long userId, int month, int year);

    List<Budget> findByUserId(Long userId);

    boolean existsByUserIdAndCategoryAndMonthAndYear(
        Long userId, ExpenseCategory category, int month, int year);
}
