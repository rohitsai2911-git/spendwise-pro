package com.spendwise.service.impl;

import com.spendwise.dto.request.GoalRequest;
import com.spendwise.dto.response.GoalResponse;
import com.spendwise.entity.Goal;
import com.spendwise.entity.User;
import com.spendwise.enums.GoalStatus;
import com.spendwise.exception.ResourceNotFoundException;
import com.spendwise.exception.UnauthorizedException;
import com.spendwise.repository.GoalRepository;
import com.spendwise.repository.UserRepository;
import com.spendwise.service.GoalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoalServiceImpl implements GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public GoalResponse createGoal(Long userId, GoalRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Goal goal = Goal.builder()
            .user(user)
            .name(request.getName())
            .targetAmount(request.getTargetAmount())
            .currentAmount(request.getCurrentAmount() != null ? request.getCurrentAmount() : 0.0)
            .targetDate(request.getTargetDate())
            .icon(request.getIcon())
            .color(request.getColor())
            .status(GoalStatus.IN_PROGRESS)
            .build();

        goal = goalRepository.save(goal);
        log.info("Goal created: {} for user {}", request.getName(), userId);
        return toResponse(goal);
    }

    @Override
    @Transactional
    public GoalResponse updateGoal(Long userId, Long goalId, GoalRequest request) {
        Goal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new ResourceNotFoundException("Goal", goalId));

        if (!goal.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You cannot modify this goal");
        }

        goal.setName(request.getName());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setTargetDate(request.getTargetDate());
        goal.setIcon(request.getIcon());
        goal.setColor(request.getColor());

        if (request.getCurrentAmount() != null) {
            goal.setCurrentAmount(request.getCurrentAmount());
        }

        if (goal.getCurrentAmount() >= goal.getTargetAmount()) {
            goal.setStatus(GoalStatus.COMPLETED);
        }

        goal = goalRepository.save(goal);
        return toResponse(goal);
    }

    @Override
    @Transactional
    public void deleteGoal(Long userId, Long goalId) {
        Goal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new ResourceNotFoundException("Goal", goalId));

        if (!goal.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You cannot delete this goal");
        }

        goalRepository.delete(goal);
        log.info("Goal deleted: {}", goalId);
    }

    @Override
    public GoalResponse getGoal(Long userId, Long goalId) {
        Goal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new ResourceNotFoundException("Goal", goalId));

        if (!goal.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You cannot view this goal");
        }

        return toResponse(goal);
    }

    @Override
    public List<GoalResponse> getUserGoals(Long userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public GoalResponse addGoalProgress(Long userId, Long goalId, Double amount) {
        Goal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new ResourceNotFoundException("Goal", goalId));

        if (!goal.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You cannot modify this goal");
        }

        goal.setCurrentAmount(goal.getCurrentAmount() + amount);

        if (goal.getCurrentAmount() >= goal.getTargetAmount()) {
            goal.setStatus(GoalStatus.COMPLETED);
        }

        goal = goalRepository.save(goal);
        log.info("Goal progress updated: {} + {} = {}", goalId, amount, goal.getCurrentAmount());
        return toResponse(goal);
    }

    private GoalResponse toResponse(Goal goal) {
        double progress = goal.getTargetAmount() > 0
            ? (goal.getCurrentAmount() / goal.getTargetAmount()) * 100 : 0;

        return GoalResponse.builder()
            .id(goal.getId())
            .name(goal.getName())
            .targetAmount(goal.getTargetAmount())
            .currentAmount(goal.getCurrentAmount())
            .progressPercent(Math.min(progress, 100))
            .targetDate(goal.getTargetDate())
            .icon(goal.getIcon())
            .color(goal.getColor())
            .status(goal.getStatus().name())
            .build();
    }
}
