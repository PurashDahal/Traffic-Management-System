package com.traffic.system.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiDescriptionResponse {
    private String generatedDescription;
}
