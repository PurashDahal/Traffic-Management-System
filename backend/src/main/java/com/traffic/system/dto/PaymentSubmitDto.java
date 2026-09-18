package com.traffic.system.dto;

import com.traffic.system.enums.PaymentMethod;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSubmitDto {
    private Long ticketId;
    private PaymentMethod paymentMethod;
    private String transactionId;
    private String notes;
}
