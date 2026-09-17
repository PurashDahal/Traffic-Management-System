package com.traffic.system.repository;

import com.traffic.system.entity.ViolationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ViolationTypeRepository extends JpaRepository<ViolationType, Long> {
    Optional<ViolationType> findByCategoryNameIgnoreCase(String categoryName);
    List<ViolationType> findByActiveTrue();
    Boolean existsByCategoryNameIgnoreCase(String categoryName);
}
