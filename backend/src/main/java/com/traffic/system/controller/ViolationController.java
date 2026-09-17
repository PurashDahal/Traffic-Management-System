package com.traffic.system.controller;

import com.traffic.system.dto.TicketDto;
import com.traffic.system.dto.ViolationCreateDto;
import com.traffic.system.service.ViolationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/violations")
public class ViolationController {

    @Autowired
    private ViolationService violationService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('TRAFFIC_OFFICER', 'ADMIN')")
    public ResponseEntity<TicketDto> createViolationTicket(
            @RequestPart("data") ViolationCreateDto dto,
            @RequestPart(value = "evidence", required = false) MultipartFile evidenceFile) {
        return ResponseEntity.ok(violationService.createViolationTicket(dto, evidenceFile));
    }
}
