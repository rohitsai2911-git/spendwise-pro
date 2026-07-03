package com.spendwise.service;

import com.spendwise.dto.response.UserResponse;
import com.spendwise.dto.response.TransactionResponse;
import com.spendwise.dto.response.DashboardResponse;

import java.util.List;
import java.util.Map;

public interface AdminService {
    DashboardResponse getAdminDashboard();
    List<UserResponse> getAllUsers();
    void deleteUser(Long userId);
    long getTotalUsers();
    long getTotalTransactions();
    Map<String, Long> getSystemStatistics();
}
