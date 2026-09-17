package com.traffic.system.dto;

import com.traffic.system.enums.AiStatus;
import com.traffic.system.enums.PaymentStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketDto {
    private Long id;
    private String ticketNumber;
    private Long violationId;
    private String vehicleNumber;
    private String vehicleType;
    private String ownerName;
    private String ownerPhone;
    private String categoryName;
    private String description;
    private String location;
    private LocalDateTime violationTime;
    private String officerNotes;
    private String officerName;
    private String officerUsername;
    private BigDecimal fineAmount;
    private PaymentStatus paymentStatus;
    private AiStatus aiStatus;
    private String aiSuggestionRaw;
    private LocalDateTime issuedAt;
    private List<String> evidenceFilePaths;
    private PaymentDto paymentDetails;
}
