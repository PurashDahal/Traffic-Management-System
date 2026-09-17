package com.traffic.system.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "violation_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ViolationType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String categoryName;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private BigDecimal defaultFineAmount;

    @Builder.Default
    private boolean active = true;
}
