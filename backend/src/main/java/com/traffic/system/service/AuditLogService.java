package com.traffic.system.service;

import com.traffic.system.dto.AuditLogDto;
import com.traffic.system.entity.AuditLog;
import com.traffic.system.entity.User;
import com.traffic.system.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void logAction(User user, String action, String entityType, String entityId, String details, String ipAddress) {
        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .username(user != null ? user.getUsername() : "SYSTEM")
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                .build();
        auditLogRepository.save(auditLog);
    }

    public List<AuditLogDto> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private AuditLogDto mapToDto(AuditLog log) {
        return AuditLogDto.builder()
                .id(log.getId())
                .userId(log.getUser() != null ? log.getUser().getId() : null)
                .username(log.getUsername())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .details(log.getDetails())
                .ipAddress(log.getIpAddress())
                .timestamp(log.getTimestamp())
                .build();
    }
}
