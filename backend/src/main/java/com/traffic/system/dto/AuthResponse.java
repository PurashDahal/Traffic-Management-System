package com.traffic.system.dto;

import com.traffic.system.enums.RoleName;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private RoleName role;
}
