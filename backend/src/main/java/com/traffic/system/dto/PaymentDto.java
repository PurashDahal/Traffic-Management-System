package com.traffic.system.dto;

import com.traffic.system.enums.PaymentStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDto {
    private Long id;
    private Long ticketId;
    private String ticketNumber;
    private String vehicleNumber;
    private String ownerName;
    private BigDecimal amount;
    private String transactionId;
    private String paymentProofPath;
    private PaymentStatus status;
    private String rejectionReason;
    private String verifiedByName;
    private LocalDateTime submittedAt;
    private LocalDateTime verifiedAt;
}
