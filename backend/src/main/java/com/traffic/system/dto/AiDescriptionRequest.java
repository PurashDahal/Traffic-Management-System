package com.traffic.system.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiDescriptionRequest {
    private String violationType;
    private String vehicleNumber;
    private String location;
    private String additionalDetails;
}
