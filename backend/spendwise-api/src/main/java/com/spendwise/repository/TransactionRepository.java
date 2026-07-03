package com.spendwise.repository;

import com.spendwise.entity.Transaction;
import com.spendwise.enums.ExpenseCategory;
import com.spendwise.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByUserIdOrderByTransactionDateDesc(Long userId, Pageable pageable);

    List<Transaction> findByUserId(Long userId);

    List<Transaction> findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
        Long userId, LocalDate start, LocalDate end);

    List<Transaction> findByUserIdAndTypeAndTransactionDateBetween(
        Long userId, TransactionType type, LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.transactionDate BETWEEN :start AND :end")
    double sumByUserIdAndTypeBetweenDates(
        @Param("userId") Long userId,
        @Param("type") TransactionType type,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end);

    @Query("SELECT t.expenseCategory, COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'EXPENSE' AND t.transactionDate BETWEEN :start AND :end GROUP BY t.expenseCategory")
    List<Object[]> sumByCategoryBetweenDates(
        @Param("userId") Long userId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'EXPENSE' AND t.expenseCategory = :category AND t.transactionDate BETWEEN :start AND :end")
    double sumByCategoryAndUserBetweenDates(
        @Param("userId") Long userId,
        @Param("category") ExpenseCategory category,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end);

    Page<Transaction> findByUserIdAndType(Long userId, TransactionType type, Pageable pageable);

    @Query("SELECT FUNCTION('MONTH', t.transactionDate), FUNCTION('YEAR', t.transactionDate), COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.transactionDate >= :since GROUP BY FUNCTION('YEAR', t.transactionDate), FUNCTION('MONTH', t.transactionDate) ORDER BY FUNCTION('YEAR', t.transactionDate), FUNCTION('MONTH', t.transactionDate)")
    List<Object[]> monthlyTotalsByType(
        @Param("userId") Long userId,
        @Param("type") TransactionType type,
        @Param("since") LocalDate since);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND " +
           "(LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.expenseCategory) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.incomeSource) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.paymentMethod) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Transaction> searchTransactions(@Param("userId") Long userId, @Param("query") String query);

    long countByUserId(Long userId);
}
