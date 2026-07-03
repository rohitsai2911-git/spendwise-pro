package com.spendwise.service.impl;

import com.spendwise.dto.request.TransactionRequest;
import com.spendwise.dto.response.PagedResponse;
import com.spendwise.dto.response.TransactionResponse;
import com.spendwise.entity.Transaction;
import com.spendwise.entity.User;
import com.spendwise.enums.TransactionType;
import com.spendwise.exception.ResourceNotFoundException;
import com.spendwise.exception.UnauthorizedException;
import com.spendwise.repository.TransactionRepository;
import com.spendwise.repository.UserRepository;
import com.spendwise.service.TransactionService;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public TransactionResponse createTransaction(Long userId, TransactionRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Transaction transaction = Transaction.builder()
            .user(user)
            .type(request.getType())
            .amount(request.getAmount())
            .description(request.getDescription())
            .transactionDate(request.getTransactionDate())
            .expenseCategory(request.getExpenseCategory())
            .incomeSource(request.getIncomeSource())
            .paymentMethod(request.getPaymentMethod())
            .isRecurring(request.isRecurring())
            .recurringFrequency(request.getRecurringFrequency())
            .nextRecurringDate(request.getNextRecurringDate())
            .notes(request.getNotes())
            .build();

        transaction = transactionRepository.save(transaction);
        log.info("Transaction created: {} {} for user {}", request.getType(), request.getAmount(), userId);
        return toResponse(transaction);
    }

    @Override
    @Transactional
    public TransactionResponse updateTransaction(Long userId, Long transactionId, TransactionRequest request) {
        Transaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new ResourceNotFoundException("Transaction", transactionId));

        if (!transaction.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You cannot modify this transaction");
        }

        transaction.setType(request.getType());
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setExpenseCategory(request.getExpenseCategory());
        transaction.setIncomeSource(request.getIncomeSource());
        transaction.setPaymentMethod(request.getPaymentMethod());
        transaction.setRecurring(request.isRecurring());
        transaction.setRecurringFrequency(request.getRecurringFrequency());
        transaction.setNextRecurringDate(request.getNextRecurringDate());
        transaction.setNotes(request.getNotes());

        transaction = transactionRepository.save(transaction);
        log.info("Transaction updated: {}", transactionId);
        return toResponse(transaction);
    }

    @Override
    @Transactional
    public void deleteTransaction(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new ResourceNotFoundException("Transaction", transactionId));

        if (!transaction.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You cannot delete this transaction");
        }

        transactionRepository.delete(transaction);
        log.info("Transaction deleted: {}", transactionId);
    }

    @Override
    public TransactionResponse getTransaction(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new ResourceNotFoundException("Transaction", transactionId));

        if (!transaction.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You cannot view this transaction");
        }

        return toResponse(transaction);
    }

    @Override
    public PagedResponse<TransactionResponse> getUserTransactions(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending());
        Page<Transaction> transactions = transactionRepository.findByUserIdOrderByTransactionDateDesc(userId, pageable);
        return toPagedResponse(transactions);
    }

    @Override
    public PagedResponse<TransactionResponse> getUserTransactionsByType(Long userId, TransactionType type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending());
        Page<Transaction> transactions = transactionRepository.findByUserIdAndType(userId, type, pageable);
        return toPagedResponse(transactions);
    }

    @Override
    public ByteArrayOutputStream exportTransactionsCsv(Long userId) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(baos))) {
            String[] header = {"ID", "Type", "Amount", "Description", "Date", "Category/Source", "Payment Method", "Notes"};
            writer.writeNext(header);

            transactionRepository.findByUserId(userId)
                .forEach(t -> writer.writeNext(new String[]{
                    t.getId().toString(),
                    t.getType().name(),
                    t.getAmount().toString(),
                    t.getDescription(),
                    t.getTransactionDate().toString(),
                    t.getExpenseCategory() != null ? t.getExpenseCategory().name() :
                        (t.getIncomeSource() != null ? t.getIncomeSource().name() : ""),
                    t.getPaymentMethod() != null ? t.getPaymentMethod().name() : "",
                    t.getNotes()
                }));
        } catch (Exception e) {
            log.error("Error generating CSV export", e);
        }

        return baos;
    }

    @Override
    public ByteArrayOutputStream exportTransactionsPdf(Long userId) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        return baos;
    }

    private TransactionResponse toResponse(Transaction t) {
        return TransactionResponse.builder()
            .id(t.getId())
            .type(t.getType().name())
            .amount(t.getAmount())
            .description(t.getDescription())
            .transactionDate(t.getTransactionDate())
            .expenseCategory(t.getExpenseCategory() != null ? t.getExpenseCategory().name() : null)
            .incomeSource(t.getIncomeSource() != null ? t.getIncomeSource().name() : null)
            .paymentMethod(t.getPaymentMethod() != null ? t.getPaymentMethod().name() : null)
            .isRecurring(t.isRecurring())
            .recurringFrequency(t.getRecurringFrequency())
            .nextRecurringDate(t.getNextRecurringDate())
            .notes(t.getNotes())
            .createdAt(t.getCreatedAt())
            .build();
    }

    private PagedResponse<TransactionResponse> toPagedResponse(Page<Transaction> page) {
        return PagedResponse.<TransactionResponse>builder()
            .content(page.getContent().stream().map(this::toResponse).toList())
            .page(page.getNumber())
            .size(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .last(page.isLast())
            .first(page.isFirst())
            .build();
    }
}
