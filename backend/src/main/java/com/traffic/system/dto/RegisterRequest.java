package com.traffic.system.dto;

import com.traffic.system.enums.RoleName;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank
    private String fullName;

    @NotBlank
    private String username;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    private String phone;
    private String citizenshipNo;
    private String drivingLicenseNo;
    private RoleName role; // Default to VEHICLE_OWNER if null
}
