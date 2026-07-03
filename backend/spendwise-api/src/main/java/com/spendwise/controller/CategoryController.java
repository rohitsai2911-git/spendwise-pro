package com.spendwise.controller;

import com.spendwise.dto.request.CategoryRequest;
import com.spendwise.dto.response.CategoryResponse;
import com.spendwise.security.UserPrincipal;
import com.spendwise.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(categoryService.createCategory(principal.getId(), request));
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(categoryService.getUserCategories(principal.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        categoryService.deleteCategory(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
