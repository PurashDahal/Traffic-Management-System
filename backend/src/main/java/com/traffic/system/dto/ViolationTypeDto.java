package com.traffic.system.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ViolationTypeDto {
    private Long id;
    private String categoryName;
    private String description;
    private BigDecimal defaultFineAmount;
    private boolean active;
}
