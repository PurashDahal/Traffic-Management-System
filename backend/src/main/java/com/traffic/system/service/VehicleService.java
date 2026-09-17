package com.traffic.system.service;

import com.traffic.system.dto.VehicleDto;
import com.traffic.system.entity.User;
import com.traffic.system.entity.Vehicle;
import com.traffic.system.enums.RoleName;
import com.traffic.system.exception.ResourceNotFoundException;
import com.traffic.system.exception.UnauthorizedException;
import com.traffic.system.repository.UserRepository;
import com.traffic.system.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private AuditLogService auditLogService;

    public VehicleDto registerVehicle(VehicleDto vehicleDto) {
        User currentUser = authService.getCurrentUser();

        if (vehicleRepository.existsByVehicleNumber(vehicleDto.getVehicleNumber())) {
            throw new RuntimeException("Vehicle number already registered!");
        }

        User owner = currentUser;
        if (vehicleDto.getOwnerId() != null && currentUser.getRole() == RoleName.ADMIN) {
            owner = userRepository.findById(vehicleDto.getOwnerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Owner not found with id: " + vehicleDto.getOwnerId()));
        }

        Vehicle vehicle = Vehicle.builder()
                .owner(owner)
                .vehicleNumber(vehicleDto.getVehicleNumber().toUpperCase())
                .vehicleType(vehicleDto.getVehicleType())
                .model(vehicleDto.getModel())
                .bluebookNumber(vehicleDto.getBluebookNumber())
                .build();

        vehicleRepository.save(vehicle);
        auditLogService.logAction(currentUser, "VEHICLE_REGISTERED", "Vehicle", vehicle.getId().toString(),
                "Registered vehicle: " + vehicle.getVehicleNumber(), null);

        return mapToDto(vehicle);
    }

    public VehicleDto findByVehicleNumber(String vehicleNumber) {
        Vehicle vehicle = vehicleRepository.findByVehicleNumberIgnoreCase(vehicleNumber.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with number: " + vehicleNumber));
        return mapToDto(vehicle);
    }

    public List<VehicleDto> getMyVehicles() {
        User currentUser = authService.getCurrentUser();
        return vehicleRepository.findByOwner(currentUser).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<VehicleDto> getAllVehicles() {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() == RoleName.VEHICLE_OWNER) {
            throw new UnauthorizedException("Vehicle Owners cannot view all vehicles.");
        }
        return vehicleRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public VehicleDto mapToDto(Vehicle vehicle) {
        return VehicleDto.builder()
                .id(vehicle.getId())
                .ownerId(vehicle.getOwner().getId())
                .ownerName(vehicle.getOwner().getFullName())
                .ownerUsername(vehicle.getOwner().getUsername())
                .ownerPhone(vehicle.getOwner().getPhone())
                .vehicleNumber(vehicle.getVehicleNumber())
                .vehicleType(vehicle.getVehicleType())
                .model(vehicle.getModel())
                .bluebookNumber(vehicle.getBluebookNumber())
                .registeredAt(vehicle.getRegisteredAt())
                .build();
    }
}
