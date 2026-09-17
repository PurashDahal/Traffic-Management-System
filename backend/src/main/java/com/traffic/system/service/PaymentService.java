package com.traffic.system.service;

import com.traffic.system.dto.PaymentDto;
import com.traffic.system.dto.PaymentSubmitDto;
import com.traffic.system.dto.PaymentVerifyDto;
import com.traffic.system.entity.Payment;
import com.traffic.system.entity.Ticket;
import com.traffic.system.entity.User;
import com.traffic.system.enums.PaymentStatus;
import com.traffic.system.enums.RoleName;
import com.traffic.system.exception.ResourceNotFoundException;
import com.traffic.system.exception.UnauthorizedException;
import com.traffic.system.repository.PaymentRepository;
import com.traffic.system.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public PaymentDto submitPaymentProof(PaymentSubmitDto dto, MultipartFile proofFile) {
        User owner = authService.getCurrentUser();

        Ticket ticket = ticketRepository.findById(dto.getTicketId())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + dto.getTicketId()));

        if (!ticket.getViolation().getVehicle().getOwner().getId().equals(owner.getId())) {
            throw new UnauthorizedException("You are not authorized to submit payment for this ticket.");
        }

        if (proofFile == null || proofFile.isEmpty()) {
            throw new RuntimeException("Payment proof screenshot is required.");
        }

        String proofPath = fileStorageService.storeFile(proofFile, "payments");

        Payment payment = paymentRepository.findByTicket(ticket).orElse(null);
        if (payment == null) {
            payment = Payment.builder()
                    .ticket(ticket)
                    .amount(ticket.getFineAmount())
                    .transactionId(dto.getTransactionId())
                    .paymentProofPath(proofPath)
                    .status(PaymentStatus.PENDING_VERIFICATION)
                    .build();
        } else {
            payment.setTransactionId(dto.getTransactionId());
            payment.setPaymentProofPath(proofPath);
            payment.setStatus(PaymentStatus.PENDING_VERIFICATION);
            payment.setRejectionReason(null);
        }

        paymentRepository.save(payment);

        ticket.setPaymentStatus(PaymentStatus.PENDING_VERIFICATION);
        ticketRepository.save(ticket);

        notificationService.sendNotification(owner,
                "Payment Submitted for Verification",
                "Your payment proof (Transaction ID: " + dto.getTransactionId() + ") for Ticket " + ticket.getTicketNumber() + " has been submitted for Admin verification.");

        auditLogService.logAction(owner, "PAYMENT_SUBMITTED", "Payment", payment.getId().toString(),
                "Submitted payment proof for Ticket " + ticket.getTicketNumber() + " (Txn ID: " + dto.getTransactionId() + ")", null);

        return mapToPaymentDto(payment);
    }

    @Transactional
    public PaymentDto verifyPayment(Long paymentId, PaymentVerifyDto verifyDto) {
        User admin = authService.getCurrentUser();
        if (admin.getRole() != RoleName.ADMIN) {
            throw new UnauthorizedException("Only Admin can verify or reject payments.");
        }

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found with id: " + paymentId));

        Ticket ticket = payment.getTicket();
        User owner = ticket.getViolation().getVehicle().getOwner();

        if (verifyDto.isApprove()) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setVerifiedBy(admin);
            payment.setVerifiedAt(LocalDateTime.now());
            payment.setRejectionReason(null);

            ticket.setPaymentStatus(PaymentStatus.PAID);

            notificationService.sendNotification(owner,
                    "Payment Verified Success",
                    "Your payment for Ticket " + ticket.getTicketNumber() + " has been verified. Payment Status: PAID.");

            auditLogService.logAction(admin, "PAYMENT_VERIFIED", "Payment", payment.getId().toString(),
                    "Admin verified payment for Ticket " + ticket.getTicketNumber() + " (Amount: Rs. " + payment.getAmount() + ")", null);
        } else {
            payment.setStatus(PaymentStatus.REJECTED);
            payment.setVerifiedBy(admin);
            payment.setVerifiedAt(LocalDateTime.now());
            payment.setRejectionReason(verifyDto.getRejectionReason() != null ? verifyDto.getRejectionReason() : "Invalid payment proof");

            ticket.setPaymentStatus(PaymentStatus.REJECTED);

            notificationService.sendNotification(owner,
                    "Payment Verification Rejected",
                    "Your payment proof for Ticket " + ticket.getTicketNumber() + " was rejected. Reason: " + payment.getRejectionReason() + ". Please upload valid proof.");

            auditLogService.logAction(admin, "PAYMENT_REJECTED", "Payment", payment.getId().toString(),
                    "Admin rejected payment for Ticket " + ticket.getTicketNumber() + ". Reason: " + payment.getRejectionReason(), null);
        }

        paymentRepository.save(payment);
        ticketRepository.save(ticket);

        return mapToPaymentDto(payment);
    }

    public List<PaymentDto> getPendingPayments() {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != RoleName.ADMIN) {
            throw new UnauthorizedException("Only Admin can access pending payments.");
        }
        return paymentRepository.findByStatus(PaymentStatus.PENDING_VERIFICATION)
                .stream().map(PaymentService::mapToPaymentDto).collect(Collectors.toList());
    }

    public List<PaymentDto> getAllPayments() {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() == RoleName.VEHICLE_OWNER) {
            return paymentRepository.findAll().stream()
                    .filter(p -> p.getTicket().getViolation().getVehicle().getOwner().getId().equals(currentUser.getId()))
                    .map(PaymentService::mapToPaymentDto).collect(Collectors.toList());
        } else if (currentUser.getRole() == RoleName.ADMIN) {
            return paymentRepository.findAll().stream().map(PaymentService::mapToPaymentDto).collect(Collectors.toList());
        } else {
            return paymentRepository.findAll().stream().map(PaymentService::mapToPaymentDto).collect(Collectors.toList());
        }
    }

    public static PaymentDto mapToPaymentDto(Payment payment) {
        Ticket t = payment.getTicket();
        return PaymentDto.builder()
                .id(payment.getId())
                .ticketId(t.getId())
                .ticketNumber(t.getTicketNumber())
                .vehicleNumber(t.getViolation().getVehicle().getVehicleNumber())
                .ownerName(t.getViolation().getVehicle().getOwner().getFullName())
                .amount(payment.getAmount())
                .transactionId(payment.getTransactionId())
                .paymentProofPath(payment.getPaymentProofPath())
                .status(payment.getStatus())
                .rejectionReason(payment.getRejectionReason())
                .verifiedByName(payment.getVerifiedBy() != null ? payment.getVerifiedBy().getFullName() : null)
                .submittedAt(payment.getSubmittedAt())
                .verifiedAt(payment.getVerifiedAt())
                .build();
    }
}
