package com.traffic.system.service;

import com.traffic.system.dto.AuthRequest;
import com.traffic.system.dto.AuthResponse;
import com.traffic.system.dto.RegisterRequest;
import com.traffic.system.entity.User;
import com.traffic.system.enums.RoleName;
import com.traffic.system.exception.UnauthorizedException;
import com.traffic.system.repository.UserRepository;
import com.traffic.system.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuditLogService auditLogService;

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!user.isActive()) {
            throw new UnauthorizedException("Account is disabled. Please contact Administrator.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        auditLogService.logAction(user, "USER_LOGIN", "User", user.getId().toString(), "User logged in successfully", null);

        return AuthResponse.builder()
                .token(jwt)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        RoleName role = request.getRole() != null ? request.getRole() : RoleName.VEHICLE_OWNER;
        // Traffic officers or admin registration via public endpoint restricted to vehicle owners unless done by Admin
        if (role != RoleName.VEHICLE_OWNER) {
            // Default to vehicle owner if public registration
            role = RoleName.VEHICLE_OWNER;
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .citizenshipNo(request.getCitizenshipNo())
                .drivingLicenseNo(request.getDrivingLicenseNo())
                .role(role)
                .active(true)
                .build();

        userRepository.save(user);
        auditLogService.logAction(user, "USER_REGISTER", "User", user.getId().toString(), "New vehicle owner registered", null);

        String jwt = jwtUtils.generateTokenFromUsername(user.getUsername());

        return AuthResponse.builder()
                .token(jwt)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new UnauthorizedException("User is not authenticated");
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User not found: " + username));
    }
}
