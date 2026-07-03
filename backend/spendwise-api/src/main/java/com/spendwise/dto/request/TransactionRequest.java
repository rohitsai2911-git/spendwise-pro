package com.spendwise.dto.request;

import com.spendwise.enums.ExpenseCategory;
import com.spendwise.enums.IncomeSource;
import com.spendwise.enums.PaymentMethod;
import com.spendwise.enums.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TransactionRequest {
    @NotNull(message = "Transaction type is required")
    private TransactionType type;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;

    private String description;

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;

    private ExpenseCategory expenseCategory;

    private IncomeSource incomeSource;

    private PaymentMethod paymentMethod;

    private boolean isRecurring;

    private String recurringFrequency;

    private LocalDate nextRecurringDate;

    private String notes;
}
