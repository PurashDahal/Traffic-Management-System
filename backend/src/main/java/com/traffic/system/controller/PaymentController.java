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
            @RequestPart("proof") MultipartFile proofFile) {
        return ResponseEntity.ok(paymentService.submitPaymentProof(dto, proofFile));
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
