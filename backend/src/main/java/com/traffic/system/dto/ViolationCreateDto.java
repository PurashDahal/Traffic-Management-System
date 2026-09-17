package com.traffic.system.dto;

import com.traffic.system.enums.AiStatus;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ViolationCreateDto {
    private String vehicleNumber;
    private Long violationTypeId;
    private String location;
    private String officerNotes;
    private BigDecimal customFineAmount; // Optional override, defaults to type fine
    private String aiSuggestionRaw;
    private AiStatus aiStatus;
}
