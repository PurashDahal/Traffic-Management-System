package com.traffic.system.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    private String username;

    @Column(nullable = false)
    private String action; // e.g. TICKET_CREATED, PAYMENT_VERIFIED, QR_UPDATED, LOGO_UPDATED

    private String entityType;

    private String entityId;

    @Column(length = 2000)
    private String details;

    private String ipAddress;

    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}
