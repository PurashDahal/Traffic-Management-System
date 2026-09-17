package com.traffic.system.controller;

import com.traffic.system.dto.VehicleDto;
import com.traffic.system.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @PostMapping
    public ResponseEntity<VehicleDto> registerVehicle(@RequestBody VehicleDto dto) {
        return ResponseEntity.ok(vehicleService.registerVehicle(dto));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('TRAFFIC_OFFICER', 'ADMIN')")
    public ResponseEntity<VehicleDto> searchVehicle(@RequestParam("number") String number) {
        return ResponseEntity.ok(vehicleService.findByVehicleNumber(number));
    }

    @GetMapping("/my")
    public ResponseEntity<List<VehicleDto>> getMyVehicles() {
        return ResponseEntity.ok(vehicleService.getMyVehicles());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('TRAFFIC_OFFICER', 'ADMIN')")
    public ResponseEntity<List<VehicleDto>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }
}
