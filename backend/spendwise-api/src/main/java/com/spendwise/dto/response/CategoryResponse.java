package com.spendwise.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private String icon;
    private String color;
    private boolean isDefault;
}
