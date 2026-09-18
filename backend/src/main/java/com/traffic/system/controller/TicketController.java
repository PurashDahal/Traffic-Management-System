package com.traffic.system.controller;

import com.traffic.system.dto.TicketDto;
import com.traffic.system.service.ViolationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private ViolationService violationService;

    @GetMapping
    public ResponseEntity<List<TicketDto>> getAllTickets() {
        return ResponseEntity.ok(violationService.getAllTickets());
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketDto>> getMyTickets() {
        return ResponseEntity.ok(violationService.getMyVehicleTickets());
    }

    @GetMapping("/{number}")
    public ResponseEntity<TicketDto> getTicketByNumber(@PathVariable String number) {
        return ResponseEntity.ok(violationService.getTicketByNumber(number));
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<TicketDto> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(violationService.getTicketById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        violationService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }
}
