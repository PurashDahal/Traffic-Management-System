package com.traffic.system.dto;

import com.traffic.system.enums.RoleName;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String fullName;
    private String username;
    private String email;
    private String phone;
    private String citizenshipNo;
    private String drivingLicenseNo;
    private RoleName role;
    private boolean active;
    private LocalDateTime createdAt;
}
