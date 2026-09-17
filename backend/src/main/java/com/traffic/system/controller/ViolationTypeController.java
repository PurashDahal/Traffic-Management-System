package com.traffic.system.controller;

import com.traffic.system.dto.ViolationTypeDto;
import com.traffic.system.service.ViolationTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/violation-types")
public class ViolationTypeController {

    @Autowired
    private ViolationTypeService violationTypeService;

    @GetMapping
    public ResponseEntity<List<ViolationTypeDto>> getActiveViolationTypes() {
        return ResponseEntity.ok(violationTypeService.getActiveViolationTypes());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ViolationTypeDto>> getAllViolationTypes() {
        return ResponseEntity.ok(violationTypeService.getAllViolationTypes());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ViolationTypeDto> createViolationType(@RequestBody ViolationTypeDto dto) {
        return ResponseEntity.ok(violationTypeService.createViolationType(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ViolationTypeDto> updateViolationType(@PathVariable Long id, @RequestBody ViolationTypeDto dto) {
        return ResponseEntity.ok(violationTypeService.updateViolationType(id, dto));
    }
}
