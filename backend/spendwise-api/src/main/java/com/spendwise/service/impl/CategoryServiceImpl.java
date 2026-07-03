package com.spendwise.service.impl;

import com.spendwise.dto.request.CategoryRequest;
import com.spendwise.dto.response.CategoryResponse;
import com.spendwise.entity.Category;
import com.spendwise.entity.User;
import com.spendwise.exception.BadRequestException;
import com.spendwise.exception.ResourceNotFoundException;
import com.spendwise.repository.CategoryRepository;
import com.spendwise.repository.UserRepository;
import com.spendwise.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CategoryResponse createCategory(Long userId, CategoryRequest request) {
        if (categoryRepository.existsByNameAndUserId(request.getName(), userId)) {
            throw new BadRequestException("Category already exists");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Category category = Category.builder()
            .name(request.getName())
            .icon(request.getIcon())
            .color(request.getColor())
            .isDefault(false)
            .user(user)
            .build();

        category = categoryRepository.save(category);
        log.info("Category created: {} for user {}", request.getName(), userId);
        return toResponse(category);
    }

    @Override
    public List<CategoryResponse> getUserCategories(Long userId) {
        return categoryRepository.findByUserIdOrIsDefaultTrueOrderByName(userId)
            .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public void deleteCategory(Long userId, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));

        if (category.isDefault()) {
            throw new BadRequestException("Cannot delete default category");
        }

        categoryRepository.delete(category);
        log.info("Category deleted: {}", categoryId);
    }

    private CategoryResponse toResponse(Category c) {
        return CategoryResponse.builder()
            .id(c.getId())
            .name(c.getName())
            .icon(c.getIcon())
            .color(c.getColor())
            .isDefault(c.isDefault())
            .build();
    }
}
