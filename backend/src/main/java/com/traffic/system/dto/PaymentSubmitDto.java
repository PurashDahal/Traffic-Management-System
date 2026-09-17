package com.traffic.system.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSubmitDto {
    private Long ticketId;
    private String transactionId;
}
