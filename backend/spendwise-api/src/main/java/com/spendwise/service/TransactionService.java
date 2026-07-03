package com.spendwise.service;

import com.spendwise.dto.request.TransactionRequest;
import com.spendwise.dto.response.PagedResponse;
import com.spendwise.dto.response.TransactionResponse;
import com.spendwise.enums.ExpenseCategory;
import com.spendwise.enums.PaymentMethod;
import com.spendwise.enums.TransactionType;

import java.io.ByteArrayOutputStream;

public interface TransactionService {
    TransactionResponse createTransaction(Long userId, TransactionRequest request);
    TransactionResponse updateTransaction(Long userId, Long transactionId, TransactionRequest request);
    void deleteTransaction(Long userId, Long transactionId);
    TransactionResponse getTransaction(Long userId, Long transactionId);
    PagedResponse<TransactionResponse> getUserTransactions(Long userId, int page, int size);
    PagedResponse<TransactionResponse> getUserTransactionsByType(Long userId, TransactionType type, int page, int size);
    ByteArrayOutputStream exportTransactionsCsv(Long userId);
    ByteArrayOutputStream exportTransactionsPdf(Long userId);
}
