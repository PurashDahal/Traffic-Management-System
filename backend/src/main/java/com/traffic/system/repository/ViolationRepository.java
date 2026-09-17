package com.traffic.system.repository;

import com.traffic.system.entity.User;
import com.traffic.system.entity.Vehicle;
import com.traffic.system.entity.Violation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ViolationRepository extends JpaRepository<Violation, Long> {
    List<Violation> findByVehicle(Vehicle vehicle);
    List<Violation> findByVehicleOwner(User owner);
    List<Violation> findByOfficer(User officer);

    @Query("SELECT v.violationType.categoryName as category, COUNT(v) as count FROM Violation v GROUP BY v.violationType.categoryName ORDER BY count DESC")
    List<Object[]> getViolationCountsByCategory();

    @Query("SELECT v.location as location, COUNT(v) as count FROM Violation v GROUP BY v.location ORDER BY count DESC")
    List<Object[]> getViolationCountsByLocation();
}
