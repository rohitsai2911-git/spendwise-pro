package com.spendwise.service;

import com.spendwise.dto.response.DashboardResponse;

public interface DashboardService {
    DashboardResponse getDashboard(Long userId);
}
