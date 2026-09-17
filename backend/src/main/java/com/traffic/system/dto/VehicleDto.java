package com.traffic.system.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleDto {
    private Long id;
    private Long ownerId;
    private String ownerName;
    private String ownerUsername;
    private String ownerPhone;
    private String vehicleNumber;
    private String vehicleType;
    private String model;
    private String bluebookNumber;
    private LocalDateTime registeredAt;
}
