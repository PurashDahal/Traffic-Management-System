package com.traffic.system.controller;

import com.traffic.system.dto.RegisterRequest;
import com.traffic.system.dto.UserDto;
import com.traffic.system.enums.RoleName;
import com.traffic.system.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/officers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getOfficers() {
        return ResponseEntity.ok(userService.getUsersByRole(RoleName.TRAFFIC_OFFICER));
    }

    @PostMapping("/officers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> createOfficer(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.createOfficer(request));
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> toggleUserActive(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUserActiveStatus(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateProfile(@PathVariable Long id, @RequestBody UserDto updateDto) {
        return ResponseEntity.ok(userService.updateProfile(id, updateDto));
    }
}
