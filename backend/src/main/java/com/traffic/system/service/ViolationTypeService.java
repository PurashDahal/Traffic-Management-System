package com.traffic.system.service;

import com.traffic.system.dto.ViolationTypeDto;
import com.traffic.system.entity.User;
import com.traffic.system.entity.ViolationType;
import com.traffic.system.enums.RoleName;
import com.traffic.system.exception.ResourceNotFoundException;
import com.traffic.system.exception.UnauthorizedException;
import com.traffic.system.repository.ViolationTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ViolationTypeService {

    @Autowired
    private ViolationTypeRepository violationTypeRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private AuditLogService auditLogService;

    public List<ViolationTypeDto> getAllViolationTypes() {
        return violationTypeRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<ViolationTypeDto> getActiveViolationTypes() {
        return violationTypeRepository.findByActiveTrue().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public ViolationTypeDto createViolationType(ViolationTypeDto dto) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != RoleName.ADMIN) {
            throw new UnauthorizedException("Only Admin can manage violation types.");
        }

        if (violationTypeRepository.existsByCategoryNameIgnoreCase(dto.getCategoryName())) {
            throw new RuntimeException("Violation type category already exists: " + dto.getCategoryName());
        }

        ViolationType violationType = ViolationType.builder()
                .categoryName(dto.getCategoryName())
                .description(dto.getDescription())
                .defaultFineAmount(dto.getDefaultFineAmount())
                .active(true)
                .build();

        violationTypeRepository.save(violationType);
        auditLogService.logAction(currentUser, "VIOLATION_TYPE_CREATED", "ViolationType", violationType.getId().toString(),
                "Created violation type: " + violationType.getCategoryName() + " with default fine: Rs. " + violationType.getDefaultFineAmount(), null);

        return mapToDto(violationType);
    }

    public ViolationTypeDto updateViolationType(Long id, ViolationTypeDto dto) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != RoleName.ADMIN) {
            throw new UnauthorizedException("Only Admin can update fine rules.");
        }

        ViolationType violationType = violationTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Violation type not found with id: " + id));

        violationType.setCategoryName(dto.getCategoryName());
        violationType.setDescription(dto.getDescription());
        violationType.setDefaultFineAmount(dto.getDefaultFineAmount());
        violationType.setActive(dto.isActive());

        violationTypeRepository.save(violationType);
        auditLogService.logAction(currentUser, "VIOLATION_TYPE_UPDATED", "ViolationType", violationType.getId().toString(),
                "Updated fine rule for " + violationType.getCategoryName() + " to Rs. " + violationType.getDefaultFineAmount(), null);

        return mapToDto(violationType);
    }

    public ViolationTypeDto mapToDto(ViolationType entity) {
        return ViolationTypeDto.builder()
                .id(entity.getId())
                .categoryName(entity.getCategoryName())
                .description(entity.getDescription())
                .defaultFineAmount(entity.getDefaultFineAmount())
                .active(entity.isActive())
                .build();
    }
}
