package com.spendwise.repository;

import com.spendwise.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserIdOrIsDefaultTrueOrderByName(Long userId);

    boolean existsByNameAndUserId(String name, Long userId);
}
