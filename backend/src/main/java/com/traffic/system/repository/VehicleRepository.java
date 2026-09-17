package com.traffic.system.repository;

import com.traffic.system.entity.User;
import com.traffic.system.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByVehicleNumberIgnoreCase(String vehicleNumber);
    List<Vehicle> findByOwner(User owner);
    List<Vehicle> findByOwnerId(Long ownerId);
    Boolean existsByVehicleNumber(String vehicleNumber);
}
