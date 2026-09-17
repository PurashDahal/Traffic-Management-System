package com.traffic.system.service;

import com.traffic.system.dto.RegisterRequest;
import com.traffic.system.dto.UserDto;
import com.traffic.system.entity.User;
import com.traffic.system.enums.RoleName;
import com.traffic.system.exception.ResourceNotFoundException;
import com.traffic.system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private AuthService authService;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<UserDto> getUsersByRole(RoleName role) {
        return userRepository.findByRole(role).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToDto(user);
    }

    public UserDto createOfficer(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        User currentUser = authService.getCurrentUser();

        User officer = User.builder()
                .fullName(request.getFullName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .citizenshipNo(request.getCitizenshipNo())
                .drivingLicenseNo(request.getDrivingLicenseNo())
                .role(RoleName.TRAFFIC_OFFICER)
                .active(true)
                .build();

        userRepository.save(officer);
        auditLogService.logAction(currentUser, "OFFICER_CREATED", "User", officer.getId().toString(), "Admin created traffic officer: " + officer.getUsername(), null);

        return mapToDto(officer);
    }

    public UserDto toggleUserActiveStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        User currentUser = authService.getCurrentUser();
        user.setActive(!user.isActive());
        userRepository.save(user);

        auditLogService.logAction(currentUser, "USER_STATUS_TOGGLED", "User", user.getId().toString(), 
                "User " + user.getUsername() + " active status set to: " + user.isActive(), null);

        return mapToDto(user);
    }

    public UserDto updateProfile(Long id, UserDto updateDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        User currentUser = authService.getCurrentUser();
        if (!currentUser.getId().equals(id) && currentUser.getRole() != RoleName.ADMIN) {
            throw new RuntimeException("Unauthorized to update this profile");
        }

        user.setFullName(updateDto.getFullName());
        user.setPhone(updateDto.getPhone());
        user.setCitizenshipNo(updateDto.getCitizenshipNo());
        user.setDrivingLicenseNo(updateDto.getDrivingLicenseNo());

        userRepository.save(user);
        auditLogService.logAction(currentUser, "PROFILE_UPDATED", "User", user.getId().toString(), "Profile updated", null);

        return mapToDto(user);
    }

    public UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .citizenshipNo(user.getCitizenshipNo())
                .drivingLicenseNo(user.getDrivingLicenseNo())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
