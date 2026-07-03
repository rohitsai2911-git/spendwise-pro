package com.spendwise.controller;

import com.spendwise.dto.request.TransactionRequest;
import com.spendwise.dto.response.PagedResponse;
import com.spendwise.dto.response.TransactionResponse;
import com.spendwise.enums.TransactionType;
import com.spendwise.security.UserPrincipal;
import com.spendwise.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(transactionService.createTransaction(principal.getId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(
            transactionService.updateTransaction(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        transactionService.deleteTransaction(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransaction(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(
            transactionService.getTransaction(principal.getId(), id));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<TransactionResponse>> getTransactions(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) TransactionType type) {
        if (type != null) {
            return ResponseEntity.ok(
                transactionService.getUserTransactionsByType(principal.getId(), type, page, size));
        }
        return ResponseEntity.ok(
            transactionService.getUserTransactions(principal.getId(), page, size));
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(
            @AuthenticationPrincipal UserPrincipal principal) {
        byte[] csv = transactionService.exportTransactionsCsv(principal.getId()).toByteArray();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=transactions.csv")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csv);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @AuthenticationPrincipal UserPrincipal principal) {
        byte[] pdf = transactionService.exportTransactionsPdf(principal.getId()).toByteArray();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=transactions.pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
    }
}
