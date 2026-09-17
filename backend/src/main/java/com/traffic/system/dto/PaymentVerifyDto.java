package com.traffic.system.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerifyDto {
    private boolean approve; // true = PAID, false = REJECTED
    private String rejectionReason;
}
