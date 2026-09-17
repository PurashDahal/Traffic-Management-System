package com.traffic.system.dto;

import lombok.*;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAnalyticsResponse {
    private long totalViolations;
    private long unpaidTickets;
    private long pendingPayments;
    private long paidTickets;
    private Double totalPaidAmount;
    private Double totalUnpaidAmount;
    private Map<String, Long> violationsByCategory;
    private Map<String, Long> violationsByLocation;
    private String aiSummaryText;
}
