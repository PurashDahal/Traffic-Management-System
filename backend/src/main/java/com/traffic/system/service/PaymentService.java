package com.traffic.system.service;

import com.traffic.system.dto.PaymentDto;
import com.traffic.system.dto.PaymentSubmitDto;
import com.traffic.system.dto.PaymentVerifyDto;
import com.traffic.system.entity.Payment;
import com.traffic.system.entity.Ticket;
import com.traffic.system.entity.User;
import com.traffic.system.enums.PaymentMethod;
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

        if (owner.getRole() == RoleName.VEHICLE_OWNER && 
            (ticket.getViolation() == null || ticket.getViolation().getVehicle() == null || ticket.getViolation().getVehicle().getOwner() == null ||
             !ticket.getViolation().getVehicle().getOwner().getId().equals(owner.getId()))) {
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
                    .paymentMethod(PaymentMethod.ESEWA)
                    .transactionId(dto.getTransactionId())
                    .paymentProofPath(proofPath)
                    .notes(dto.getNotes())
                    .status(PaymentStatus.PENDING_VERIFICATION)
                    .build();
        } else {
            payment.setPaymentMethod(PaymentMethod.ESEWA);
            payment.setTransactionId(dto.getTransactionId());
            payment.setPaymentProofPath(proofPath);
            payment.setNotes(dto.getNotes());
            payment.setStatus(PaymentStatus.PENDING_VERIFICATION);
            payment.setRejectionReason(null);
        }

        paymentRepository.save(payment);

        ticket.setPaymentStatus(PaymentStatus.PENDING_VERIFICATION);
        ticketRepository.save(ticket);

        User vehicleOwner = (ticket.getViolation() != null && ticket.getViolation().getVehicle() != null)
                ? ticket.getViolation().getVehicle().getOwner()
                : owner;

        if (vehicleOwner != null) {
            try {
                notificationService.sendNotification(vehicleOwner,
                        "eSewa Payment Submitted",
                        "Your online eSewa payment proof (Txn ID: " + dto.getTransactionId() + ") for Ticket " + ticket.getTicketNumber() + " has been submitted for verification.");
            } catch (Exception ignored) {}
        }

        auditLogService.logAction(owner, "PAYMENT_SUBMITTED", "Payment", payment.getId().toString(),
                "Submitted eSewa payment proof for Ticket " + ticket.getTicketNumber() + " (Txn ID: " + dto.getTransactionId() + ")", null);

        return mapToPaymentDto(payment);
    }

    @Transactional
    public PaymentDto submitCashPayment(Long ticketId, String notes) {
        User owner = authService.getCurrentUser();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        if (owner.getRole() == RoleName.VEHICLE_OWNER && 
            (ticket.getViolation() == null || ticket.getViolation().getVehicle() == null || ticket.getViolation().getVehicle().getOwner() == null ||
             !ticket.getViolation().getVehicle().getOwner().getId().equals(owner.getId()))) {
            throw new UnauthorizedException("You are not authorized to request payment for this ticket.");
        }

        String cashTxnId = "CASH-HANDOVER-" + (System.currentTimeMillis() % 1000000);

        Payment payment = paymentRepository.findByTicket(ticket).orElse(null);
        if (payment == null) {
            payment = Payment.builder()
                    .ticket(ticket)
                    .amount(ticket.getFineAmount())
                    .paymentMethod(PaymentMethod.CASH)
                    .transactionId(cashTxnId)
                    .notes(notes != null && !notes.trim().isEmpty() ? notes.trim() : "Cash payment handed over to on-duty traffic officer")
                    .status(PaymentStatus.PENDING_VERIFICATION)
                    .build();
        } else {
            payment.setPaymentMethod(PaymentMethod.CASH);
            payment.setTransactionId(cashTxnId);
            payment.setNotes(notes != null && !notes.trim().isEmpty() ? notes.trim() : "Cash payment handed over to on-duty traffic officer");
            payment.setStatus(PaymentStatus.PENDING_VERIFICATION);
            payment.setRejectionReason(null);
        }

        paymentRepository.save(payment);

        ticket.setPaymentStatus(PaymentStatus.PENDING_VERIFICATION);
        ticketRepository.save(ticket);

        User vehicleOwner = (ticket.getViolation() != null && ticket.getViolation().getVehicle() != null)
                ? ticket.getViolation().getVehicle().getOwner()
                : owner;

        if (vehicleOwner != null) {
            try {
                notificationService.sendNotification(vehicleOwner,
                        "Cash Payment Request Recorded",
                        "Your Cash payment request of Rs. " + ticket.getFineAmount() + " for Ticket " + ticket.getTicketNumber() + " has been recorded. Traffic Officer will confirm payment on receipt.");
            } catch (Exception ignored) {}
        }

        auditLogService.logAction(owner, "CASH_PAYMENT_SUBMITTED", "Payment", payment.getId().toString(),
                "Submitted Cash handover payment request for Ticket " + ticket.getTicketNumber() + " (Amount: Rs. " + ticket.getFineAmount() + ")", null);

        return mapToPaymentDto(payment);
    }

    @Transactional
    public PaymentDto collectCashPaymentDirectly(Long ticketId, String notes) {
        User officer = authService.getCurrentUser();
        if (officer.getRole() != RoleName.TRAFFIC_OFFICER && officer.getRole() != RoleName.ADMIN) {
            throw new UnauthorizedException("Only Traffic Officers or Admin can collect and verify cash payments on-spot.");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        String cashTxnId = "CASH-SPOT-" + System.currentTimeMillis() % 1000000;
        String noteText = (notes != null && !notes.trim().isEmpty())
                ? notes.trim()
                : "Cash fine received on-spot by Officer " + officer.getFullName();

        Payment payment = paymentRepository.findByTicket(ticket).orElse(null);
        if (payment == null) {
            payment = Payment.builder()
                    .ticket(ticket)
                    .amount(ticket.getFineAmount())
                    .paymentMethod(PaymentMethod.CASH)
                    .transactionId(cashTxnId)
                    .notes(noteText)
                    .status(PaymentStatus.PAID)
                    .verifiedBy(officer)
                    .verifiedAt(LocalDateTime.now())
                    .build();
        } else {
            payment.setPaymentMethod(PaymentMethod.CASH);
            payment.setTransactionId(cashTxnId);
            payment.setNotes(noteText);
            payment.setStatus(PaymentStatus.PAID);
            payment.setVerifiedBy(officer);
            payment.setVerifiedAt(LocalDateTime.now());
            payment.setRejectionReason(null);
        }

        paymentRepository.save(payment);

        ticket.setPaymentStatus(PaymentStatus.PAID);
        ticketRepository.save(ticket);

        User owner = (ticket.getViolation() != null && ticket.getViolation().getVehicle() != null)
                ? ticket.getViolation().getVehicle().getOwner()
                : null;
        if (owner != null) {
            try {
                notificationService.sendNotification(owner,
                        "Cash Payment Received & Verified",
                        "Traffic Officer " + officer.getFullName() + " has confirmed receipt of Rs. " + payment.getAmount() + " in Cash for Ticket " + ticket.getTicketNumber() + ". Payment Status: PAID.");
            } catch (Exception ignored) {}
        }

        auditLogService.logAction(officer, "CASH_COLLECTED", "Payment", payment.getId().toString(),
                officer.getRole() + " " + officer.getFullName() + " collected Rs. " + payment.getAmount() + " CASH for Ticket " + ticket.getTicketNumber() + " (Marked PAID)", null);

        return mapToPaymentDto(payment);
    }

    @Transactional
    public PaymentDto verifyPayment(Long paymentId, PaymentVerifyDto verifyDto) {
        User verifier = authService.getCurrentUser();
        if (verifier.getRole() != RoleName.ADMIN && verifier.getRole() != RoleName.TRAFFIC_OFFICER) {
            throw new UnauthorizedException("Only Admin or Traffic Officers can verify or reject payments.");
        }

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found with id: " + paymentId));

        Ticket ticket = payment.getTicket();
        User owner = (ticket != null && ticket.getViolation() != null && ticket.getViolation().getVehicle() != null)
                ? ticket.getViolation().getVehicle().getOwner()
                : null;
        String ticketNumber = ticket != null ? ticket.getTicketNumber() : "N/A";
        String methodLabel = (payment.getPaymentMethod() == PaymentMethod.CASH) ? "Cash" : "eSewa";

        if (verifyDto.isApprove()) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setVerifiedBy(verifier);
            payment.setVerifiedAt(LocalDateTime.now());
            payment.setRejectionReason(null);

            if (ticket != null) {
                ticket.setPaymentStatus(PaymentStatus.PAID);
                ticketRepository.save(ticket);
            }

            if (owner != null) {
                try {
                    notificationService.sendNotification(owner,
                            methodLabel + " Payment Verified Success",
                            "Your " + methodLabel + " payment of Rs. " + payment.getAmount() + " for Ticket " + ticketNumber + " has been verified by " + verifier.getFullName() + ". Payment Status: PAID.");
                } catch (Exception ignored) {}
            }

            auditLogService.logAction(verifier, "PAYMENT_VERIFIED", "Payment", payment.getId().toString(),
                    verifier.getRole() + " " + verifier.getFullName() + " verified " + methodLabel + " payment for Ticket " + ticketNumber + " (Amount: Rs. " + payment.getAmount() + ")", null);
        } else {
            payment.setStatus(PaymentStatus.REJECTED);
            payment.setVerifiedBy(verifier);
            payment.setVerifiedAt(LocalDateTime.now());
            payment.setRejectionReason(verifyDto.getRejectionReason() != null ? verifyDto.getRejectionReason() : "Payment rejected");

            if (ticket != null) {
                ticket.setPaymentStatus(PaymentStatus.REJECTED);
                ticketRepository.save(ticket);
            }

            if (owner != null) {
                try {
                    notificationService.sendNotification(owner,
                            methodLabel + " Payment Rejected",
                            "Your " + methodLabel + " payment for Ticket " + ticketNumber + " was rejected by " + verifier.getFullName() + ". Reason: " + payment.getRejectionReason());
                } catch (Exception ignored) {}
            }

            auditLogService.logAction(verifier, "PAYMENT_REJECTED", "Payment", payment.getId().toString(),
                    verifier.getRole() + " rejected " + methodLabel + " payment for Ticket " + ticketNumber + ". Reason: " + payment.getRejectionReason(), null);
        }

        paymentRepository.save(payment);

        return mapToPaymentDto(payment);
    }

    public List<PaymentDto> getPendingPayments() {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != RoleName.ADMIN && currentUser.getRole() != RoleName.TRAFFIC_OFFICER) {
            throw new UnauthorizedException("Only Admin or Traffic Officers can access pending payments.");
        }
        return paymentRepository.findByStatus(PaymentStatus.PENDING_VERIFICATION)
                .stream().map(PaymentService::mapToPaymentDto).collect(Collectors.toList());
    }

    public List<PaymentDto> getAllPayments() {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() == RoleName.VEHICLE_OWNER) {
            return paymentRepository.findAll().stream()
                    .filter(p -> p != null && p.getTicket() != null && p.getTicket().getViolation() != null 
                            && p.getTicket().getViolation().getVehicle() != null 
                            && p.getTicket().getViolation().getVehicle().getOwner() != null 
                            && currentUser.getId().equals(p.getTicket().getViolation().getVehicle().getOwner().getId()))
                    .map(PaymentService::mapToPaymentDto)
                    .collect(Collectors.toList());
        } else {
            return paymentRepository.findAll().stream()
                    .map(PaymentService::mapToPaymentDto)
                    .collect(Collectors.toList());
        }
    }

    public static PaymentDto mapToPaymentDto(Payment payment) {
        if (payment == null) return null;
        Ticket t = payment.getTicket();
        Long ticketId = null;
        String ticketNumber = null;
        String vehicleNumber = null;
        String ownerName = null;

        if (t != null) {
            ticketId = t.getId();
            ticketNumber = t.getTicketNumber();
            if (t.getViolation() != null && t.getViolation().getVehicle() != null) {
                vehicleNumber = t.getViolation().getVehicle().getVehicleNumber();
                if (t.getViolation().getVehicle().getOwner() != null) {
                    ownerName = t.getViolation().getVehicle().getOwner().getFullName();
                }
            }
        }

        return PaymentDto.builder()
                .id(payment.getId())
                .ticketId(ticketId)
                .ticketNumber(ticketNumber)
                .vehicleNumber(vehicleNumber)
                .ownerName(ownerName)
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod() : PaymentMethod.ESEWA)
                .transactionId(payment.getTransactionId())
                .paymentProofPath(payment.getPaymentProofPath())
                .status(payment.getStatus())
                .rejectionReason(payment.getRejectionReason())
                .notes(payment.getNotes())
                .verifiedByName(payment.getVerifiedBy() != null ? payment.getVerifiedBy().getFullName() : null)
                .submittedAt(payment.getSubmittedAt())
                .verifiedAt(payment.getVerifiedAt())
                .build();
    }
}
