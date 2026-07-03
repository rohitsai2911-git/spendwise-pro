package com.spendwise.repository;

import com.spendwise.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByResetPasswordToken(String token);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :since")
    long countUsersSince(LocalDateTime since);
}
