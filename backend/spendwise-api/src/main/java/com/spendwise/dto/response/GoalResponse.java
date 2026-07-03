package com.spendwise.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class GoalResponse {
    private Long id;
    private String name;
    private Double targetAmount;
    private Double currentAmount;
    private double progressPercent;
    private LocalDate targetDate;
    private String icon;
    private String color;
    private String status;
}
