package com.traffic.system.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiClassifyResponse {
    private String suggestedViolation;
    private String suggestedSeverity; // High, Medium, Low
    private String reason;
}
