package com.traffic.system.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDto {
    private Long id;
    private Long userId;
    private String username;
    private String action;
    private String entityType;
    private String entityId;
    private String details;
    private String ipAddress;
    private LocalDateTime timestamp;
}
