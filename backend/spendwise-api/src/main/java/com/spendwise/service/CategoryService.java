package com.spendwise.service;

import com.spendwise.dto.request.CategoryRequest;
import com.spendwise.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(Long userId, CategoryRequest request);
    List<CategoryResponse> getUserCategories(Long userId);
    void deleteCategory(Long userId, Long categoryId);
}
