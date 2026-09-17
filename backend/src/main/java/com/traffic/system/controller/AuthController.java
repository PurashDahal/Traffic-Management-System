package com.traffic.system.controller;

import com.traffic.system.dto.AuthRequest;
import com.traffic.system.dto.AuthResponse;
import com.traffic.system.dto.RegisterRequest;
import com.traffic.system.entity.User;
import com.traffic.system.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }
}
