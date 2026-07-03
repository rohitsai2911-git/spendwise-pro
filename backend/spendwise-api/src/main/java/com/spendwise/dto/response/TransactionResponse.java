package com.spendwise.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionResponse {
    private Long id;
    private String type;
    private Double amount;
    private String description;
    private LocalDate transactionDate;
    private String expenseCategory;
    private String incomeSource;
    private String paymentMethod;
    private boolean isRecurring;
    private String recurringFrequency;
    private LocalDate nextRecurringDate;
    private String notes;
    private LocalDateTime createdAt;
}
