package com.traffic.system.entity;

import com.traffic.system.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String transactionId;

    @Column(nullable = false)
    private String paymentProofPath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(length = 1000)
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    private LocalDateTime submittedAt;

    private LocalDateTime verifiedAt;

    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
    }
}
