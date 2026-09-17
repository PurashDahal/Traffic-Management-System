package com.traffic.system.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, unique = true)
    private String vehicleNumber; // e.g. BA 12 PA 3456

    @Column(nullable = false)
    private String vehicleType; // e.g. Motorcycle, Car, Bus, Truck

    private String model;

    private String bluebookNumber;

    private LocalDateTime registeredAt;

    @PrePersist
    protected void onCreate() {
        this.registeredAt = LocalDateTime.now();
    }
}
