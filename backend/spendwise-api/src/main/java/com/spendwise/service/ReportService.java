package com.spendwise.service;

import com.spendwise.dto.response.ReportResponse;

import java.io.ByteArrayOutputStream;

public interface ReportService {
    ReportResponse getDailyReport(Long userId, int year, int month, int day);
    ReportResponse getWeeklyReport(Long userId, int year, int month, int day);
    ReportResponse getMonthlyReport(Long userId, int year, int month);
    ReportResponse getYearlyReport(Long userId, int year);
    ByteArrayOutputStream downloadReportPdf(Long userId, String period, int year, int month, Integer day);
}
