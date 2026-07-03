package com.spendwise.repository;

import com.spendwise.entity.Goal;
import com.spendwise.enums.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Goal> findByUserIdAndStatus(Long userId, GoalStatus status);

    long countByUserIdAndStatus(Long userId, GoalStatus status);
}
