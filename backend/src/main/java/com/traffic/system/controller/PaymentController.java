package com.traffic.system.controller;

import com.traffic.system.dto.PaymentDto;
import com.traffic.system.dto.PaymentSubmitDto;
import com.traffic.system.dto.PaymentVerifyDto;
import com.traffic.system.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping(value = "/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PaymentDto> submitPaymentProof(
            @RequestPart("data") PaymentSubmitDto dto,
            @RequestPart(value = "proof", required = false) MultipartFile proofFile) {
        return ResponseEntity.ok(paymentService.submitPaymentProof(dto, proofFile));
    }

    @PostMapping("/cash-submit")
    public ResponseEntity<PaymentDto> submitCashPayment(@RequestBody java.util.Map<String, Object> payload) {
        if (payload == null || !payload.containsKey("ticketId") || payload.get("ticketId") == null) {
            throw new IllegalArgumentException("Ticket ID is required for cash payment submission.");
        }
        Long ticketId = Long.valueOf(payload.get("ticketId").toString());
        String notes = payload.get("notes") != null ? payload.get("notes").toString() : null;
        return ResponseEntity.ok(paymentService.submitCashPayment(ticketId, notes));
    }

    @PostMapping("/cash-collect/{ticketId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAFFIC_OFFICER')")
    public ResponseEntity<PaymentDto> collectCashPaymentDirectly(
            @PathVariable Long ticketId,
            @RequestBody(required = false) java.util.Map<String, String> payload) {
        String notes = (payload != null && payload.containsKey("notes")) ? payload.get("notes") : null;
        return ResponseEntity.ok(paymentService.collectCashPaymentDirectly(ticketId, notes));
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAFFIC_OFFICER')")
    public ResponseEntity<PaymentDto> verifyPayment(
            @PathVariable Long id,
            @RequestBody PaymentVerifyDto verifyDto) {
        return ResponseEntity.ok(paymentService.verifyPayment(id, verifyDto));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAFFIC_OFFICER')")
    public ResponseEntity<List<PaymentDto>> getPendingPayments() {
        return ResponseEntity.ok(paymentService.getPendingPayments());
    }

    @GetMapping
    public ResponseEntity<List<PaymentDto>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }
}
