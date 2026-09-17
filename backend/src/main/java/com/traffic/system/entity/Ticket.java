package com.traffic.system.entity;

import com.traffic.system.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String ticketNumber; // e.g. TV-2026-001245

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "violation_id", nullable = false)
    private Violation violation;

    @Column(nullable = false)
    private BigDecimal fineAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    private LocalDateTime issuedAt;

    @PrePersist
    protected void onCreate() {
        this.issuedAt = LocalDateTime.now();
    }
}
