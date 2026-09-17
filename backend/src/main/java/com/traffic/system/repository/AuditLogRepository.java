package com.traffic.system.repository;

import com.traffic.system.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findAllByOrderByTimestampDesc();
    List<AuditLog> findByUserIdOrderByTimestampDesc(Long userId);
    List<AuditLog> findByActionOrderByTimestampDesc(String action);
}
