package com.spendwise.controller;

import com.spendwise.dto.response.ReportResponse;
import com.spendwise.security.UserPrincipal;
import com.spendwise.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/daily")
    public ResponseEntity<ReportResponse> getDailyReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam int day) {
        return ResponseEntity.ok(
            reportService.getDailyReport(principal.getId(), year, month, day));
    }

    @GetMapping("/weekly")
    public ResponseEntity<ReportResponse> getWeeklyReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam int day) {
        return ResponseEntity.ok(
            reportService.getWeeklyReport(principal.getId(), year, month, day));
    }

    @GetMapping("/monthly")
    public ResponseEntity<ReportResponse> getMonthlyReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(
            reportService.getMonthlyReport(principal.getId(), year, month));
    }

    @GetMapping("/yearly")
    public ResponseEntity<ReportResponse> getYearlyReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam int year) {
        return ResponseEntity.ok(
            reportService.getYearlyReport(principal.getId(), year));
    }

    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam String period,
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer day) {
        byte[] pdf = reportService.downloadReportPdf(
            principal.getId(), period, year, month != null ? month : 0, day)
            .toByteArray();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=report_" + period.toLowerCase() + "_" + year + ".pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
    }
}
