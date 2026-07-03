package com.spendwise.service;

import com.spendwise.dto.request.*;
import com.spendwise.dto.response.AuthResponse;
import com.spendwise.dto.response.UserResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserResponse getCurrentUser(String email);
    void changePassword(Long userId, ChangePasswordRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    UserResponse updateProfile(Long userId, UserResponse request);
    UserResponse updateProfilePicture(Long userId, String pictureUrl);
    UserResponse toggleDarkMode(Long userId);
}
