package com.traffic.system.entity;

import com.traffic.system.enums.AiStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "violations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Violation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "officer_id", nullable = false)
    private User officer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "violation_type_id", nullable = false)
    private ViolationType violationType;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private LocalDateTime violationTime;

    @Column(length = 2000)
    private String officerNotes;

    @Column(length = 2000)
    private String aiSuggestionRaw;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AiStatus aiStatus = AiStatus.NONE;
}
