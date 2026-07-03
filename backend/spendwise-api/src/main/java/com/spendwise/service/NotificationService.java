package com.spendwise.service;

import com.spendwise.dto.response.NotificationResponse;
import com.spendwise.enums.NotificationType;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getUserNotifications(Long userId);
    List<NotificationResponse> getUnreadNotifications(Long userId);
    long getUnreadCount(Long userId);
    void markAsRead(Long userId, Long notificationId);
    void markAllAsRead(Long userId);
    void createNotification(Long userId, NotificationType type, String title, String message);
}
