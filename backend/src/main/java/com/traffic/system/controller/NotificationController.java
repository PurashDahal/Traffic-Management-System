package com.traffic.system.controller;

import com.traffic.system.entity.Notification;
import com.traffic.system.entity.User;
import com.traffic.system.service.AuthService;
import com.traffic.system.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}
