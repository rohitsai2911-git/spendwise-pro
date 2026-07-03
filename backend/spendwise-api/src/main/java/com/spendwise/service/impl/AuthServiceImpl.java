package com.spendwise.service.impl;

import com.spendwise.dto.request.*;
import com.spendwise.dto.response.AuthResponse;
import com.spendwise.dto.response.UserResponse;
import com.spendwise.entity.User;
import com.spendwise.enums.Role;
import com.spendwise.exception.BadRequestException;
import com.spendwise.exception.DuplicateResourceException;
import com.spendwise.exception.ResourceNotFoundException;
import com.spendwise.repository.UserRepository;
import com.spendwise.security.JwtTokenProvider;
import com.spendwise.security.UserPrincipal;
import com.spendwise.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${app.jwt.remember-me-expiration-ms}")
    private long rememberMeExpirationMs;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }

        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail().toLowerCase().trim())
            .password(passwordEncoder.encode(request.getPassword()))
            .phone(request.getPhone())
            .role(Role.ROLE_USER)
            .monthlyIncome(0.0)
            .darkMode(false)
            .emailVerified(false)
            .build();

        user = userRepository.save(user);
        log.info("User registered successfully: {}", user.getEmail());

        Authentication authentication = new UsernamePasswordAuthenticationToken(
            new UserPrincipal(user), null, new UserPrincipal(user).getAuthorities());

        String token = jwtTokenProvider.generateToken(authentication, false);

        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .expiresIn(jwtExpirationMs)
            .user(toUserResponse(user))
            .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail().toLowerCase().trim(),
                request.getPassword()));

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User", userPrincipal.getId()));

        String token = jwtTokenProvider.generateToken(authentication, request.isRememberMe());
        long expiresIn = request.isRememberMe() ? rememberMeExpirationMs : jwtExpirationMs;

        log.info("User logged in: {}", user.getEmail());

        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .expiresIn(expiresIn)
            .user(toUserResponse(user))
            .build();
    }

    @Override
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toUserResponse(user);
    }

    @Override
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user: {}", user.getEmail());
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail().toLowerCase().trim())
            .ifPresent(user -> {
                String token = UUID.randomUUID().toString();
                user.setResetPasswordToken(token);
                user.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(1));
                userRepository.save(user);
                log.info("Password reset token generated for: {}", user.getEmail());
            });
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetPasswordToken(request.getToken())
            .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (user.getResetPasswordTokenExpiry() == null ||
            user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);
        log.info("Password reset successfully for: {}", user.getEmail());
    }

    @Override
    public UserResponse updateProfile(Long userId, UserResponse request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getMonthlyIncome() != null) user.setMonthlyIncome(request.getMonthlyIncome());

        user = userRepository.save(user);
        return toUserResponse(user);
    }

    @Override
    public UserResponse updateProfilePicture(Long userId, String pictureUrl) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setProfilePictureUrl(pictureUrl);
        user = userRepository.save(user);
        return toUserResponse(user);
    }

    @Override
    public UserResponse toggleDarkMode(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setDarkMode(!user.isDarkMode());
        user = userRepository.save(user);
        return toUserResponse(user);
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .phone(user.getPhone())
            .profilePictureUrl(user.getProfilePictureUrl())
            .monthlyIncome(user.getMonthlyIncome())
            .role(user.getRole().name())
            .darkMode(user.isDarkMode())
            .emailVerified(user.isEmailVerified())
            .build();
    }
}
