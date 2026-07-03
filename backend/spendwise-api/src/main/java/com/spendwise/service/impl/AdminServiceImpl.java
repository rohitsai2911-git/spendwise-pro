package com.spendwise.service.impl;

import com.spendwise.dto.response.DashboardResponse;
import com.spendwise.dto.response.UserResponse;
import com.spendwise.repository.*;
import com.spendwise.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final GoalRepository goalRepository;

    @Override
    public DashboardResponse getAdminDashboard() {
        return null;
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
            .map(u -> UserResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .role(u.getRole().name())
                .monthlyIncome(u.getMonthlyIncome())
                .emailVerified(u.isEmailVerified())
                .build())
            .toList();
    }

    @Override
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
        log.info("Admin deleted user: {}", userId);
    }

    @Override
    public long getTotalUsers() {
        return userRepository.count();
    }

    @Override
    public long getTotalTransactions() {
        return transactionRepository.count();
    }

    @Override
    public Map<String, Long> getSystemStatistics() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalTransactions", transactionRepository.count());
        stats.put("totalBudgets", budgetRepository.count());
        stats.put("totalGoals", goalRepository.count());
        stats.put("newUsersThisMonth", userRepository.countUsersSince(
            LocalDate.now().withDayOfMonth(1).atStartOfDay()));
        return stats;
    }
}
