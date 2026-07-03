package com.spendwise.controller;

import com.spendwise.dto.response.TransactionResponse;
import com.spendwise.dto.response.UserResponse;
import com.spendwise.repository.TransactionRepository;
import com.spendwise.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final TransactionRepository transactionRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> globalSearch(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam String q) {
        List<TransactionResponse> transactions = transactionRepository
            .searchTransactions(principal.getId(), q)
            .stream()
            .map(t -> TransactionResponse.builder()
                .id(t.getId())
                .type(t.getType().name())
                .amount(t.getAmount())
                .description(t.getDescription())
                .transactionDate(t.getTransactionDate())
                .expenseCategory(t.getExpenseCategory() != null ? t.getExpenseCategory().name() : null)
                .incomeSource(t.getIncomeSource() != null ? t.getIncomeSource().name() : null)
                .createdAt(t.getCreatedAt())
                .build())
            .toList();

        return ResponseEntity.ok(Map.of(
            "query", q,
            "results", transactions,
            "count", transactions.size()
        ));
    }
}
