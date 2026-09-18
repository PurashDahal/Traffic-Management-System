package com.traffic.system.service;

import com.traffic.system.dto.TicketDto;
import com.traffic.system.dto.ViolationCreateDto;
import com.traffic.system.entity.*;
import com.traffic.system.enums.AiStatus;
import com.traffic.system.enums.PaymentStatus;
import com.traffic.system.enums.RoleName;
import com.traffic.system.exception.ResourceNotFoundException;
import com.traffic.system.exception.UnauthorizedException;
import com.traffic.system.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ViolationService {

    @Autowired
    private ViolationRepository violationRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ViolationTypeRepository violationTypeRepository;

    @Autowired
    private EvidenceRepository evidenceRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public TicketDto createViolationTicket(ViolationCreateDto dto, MultipartFile evidenceFile) {
        User officer = authService.getCurrentUser();
        if (officer.getRole() != RoleName.TRAFFIC_OFFICER && officer.getRole() != RoleName.ADMIN) {
            throw new UnauthorizedException("Only Traffic Officers can issue digital tickets.");
        }

        Vehicle vehicle = vehicleRepository.findByVehicleNumberIgnoreCase(dto.getVehicleNumber().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with number: " + dto.getVehicleNumber()));

        ViolationType violationType = violationTypeRepository.findById(dto.getViolationTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Violation type not found with id: " + dto.getViolationTypeId()));

        BigDecimal fineAmount = dto.getCustomFineAmount() != null ? dto.getCustomFineAmount() : violationType.getDefaultFineAmount();

        Violation violation = Violation.builder()
                .vehicle(vehicle)
                .officer(officer)
                .violationType(violationType)
                .location(dto.getLocation())
                .violationTime(LocalDateTime.now())
                .officerNotes(dto.getOfficerNotes())
                .aiSuggestionRaw(dto.getAiSuggestionRaw())
                .aiStatus(dto.getAiStatus() != null ? dto.getAiStatus() : AiStatus.NONE)
                .build();

        violationRepository.save(violation);

        // Generate unique ticket number: TV-YYYY-XXXXXX
        String ticketNumber = generateUniqueTicketNumber();

        Ticket ticket = Ticket.builder()
                .ticketNumber(ticketNumber)
                .violation(violation)
                .fineAmount(fineAmount)
                .paymentStatus(PaymentStatus.UNPAID)
                .build();

        ticketRepository.save(ticket);

        // Process Evidence photo if provided
        if (evidenceFile != null && !evidenceFile.isEmpty()) {
            String filePath = fileStorageService.storeFile(evidenceFile, "evidence");
            Evidence evidence = Evidence.builder()
                    .ticket(ticket)
                    .filePath(filePath)
                    .fileType(evidenceFile.getContentType())
                    .build();
            evidenceRepository.save(evidence);
        }

        // Notify Vehicle Owner
        User owner = vehicle.getOwner();
        notificationService.sendNotification(owner,
                "New Traffic Violation Issued",
                "A new violation (" + violationType.getCategoryName() + ") has been issued for vehicle "
                        + vehicle.getVehicleNumber() + ". Ticket ID: " + ticketNumber + ". Fine: Rs. " + fineAmount);

        // Audit Log
        auditLogService.logAction(officer, "TICKET_CREATED", "Ticket", ticket.getId().toString(),
                "Issued ticket " + ticketNumber + " to " + vehicle.getVehicleNumber() + " for " + violationType.getCategoryName() + " (Rs. " + fineAmount + ")", null);

        return mapToTicketDto(ticket);
    }

    public List<TicketDto> getAllTickets() {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() == RoleName.VEHICLE_OWNER) {
            return ticketRepository.findByViolationVehicleOwnerId(currentUser.getId())
                    .stream().map(this::mapToTicketDto).collect(Collectors.toList());
        } else if (currentUser.getRole() == RoleName.TRAFFIC_OFFICER) {
            return ticketRepository.findAll().stream().map(this::mapToTicketDto).collect(Collectors.toList());
        } else { // ADMIN
            return ticketRepository.findAll().stream().map(this::mapToTicketDto).collect(Collectors.toList());
        }
    }

    public List<TicketDto> getMyVehicleTickets() {
        User owner = authService.getCurrentUser();
        return ticketRepository.findByViolationVehicleOwnerId(owner.getId())
                .stream().map(this::mapToTicketDto).collect(Collectors.toList());
    }

    public TicketDto getTicketByNumber(String ticketNumber) {
        Ticket ticket = ticketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with number: " + ticketNumber));

        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() == RoleName.VEHICLE_OWNER &&
                !ticket.getViolation().getVehicle().getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to view this ticket.");
        }

        return mapToTicketDto(ticket);
    }

    public TicketDto getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() == RoleName.VEHICLE_OWNER &&
                !ticket.getViolation().getVehicle().getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to view this ticket.");
        }

        return mapToTicketDto(ticket);
    }

    @Transactional
    public void deleteTicket(Long ticketId) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != RoleName.ADMIN) {
            throw new UnauthorizedException("Only Admin can delete traffic violation tickets.");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        Violation violation = ticket.getViolation();
        String ticketNumber = ticket.getTicketNumber();
        String vehicleNumber = (violation != null && violation.getVehicle() != null) ? violation.getVehicle().getVehicleNumber() : "N/A";
        User vehicleOwner = (violation != null && violation.getVehicle() != null) ? violation.getVehicle().getOwner() : null;

        // 1. Delete associated payment and payment proof file if exists
        Payment payment = paymentRepository.findByTicket(ticket).orElse(null);
        if (payment != null) {
            if (payment.getPaymentProofPath() != null) {
                fileStorageService.deleteFile(payment.getPaymentProofPath());
            }
            paymentRepository.delete(payment);
        }

        // 2. Delete associated evidence records and files
        List<Evidence> evidences = evidenceRepository.findByTicket(ticket);
        if (!evidences.isEmpty()) {
            for (Evidence ev : evidences) {
                if (ev.getFilePath() != null) {
                    fileStorageService.deleteFile(ev.getFilePath());
                }
            }
            evidenceRepository.deleteAll(evidences);
        }

        // 3. Delete Ticket & Violation
        ticketRepository.delete(ticket);
        if (violation != null) {
            violationRepository.delete(violation);
        }

        // 4. Send cancellation notification to Vehicle Owner
        if (vehicleOwner != null) {
            try {
                notificationService.sendNotification(
                        vehicleOwner,
                        "Violation Ticket Cancelled",
                        "Traffic violation ticket " + ticketNumber + " for vehicle " + vehicleNumber + " has been cancelled and removed by the Administrator."
                );
            } catch (Exception ignored) {}
        }

        // 5. Audit Log
        auditLogService.logAction(currentUser, "TICKET_DELETED", "Ticket", ticketId.toString(),
                "Admin deleted ticket " + ticketNumber + " (Vehicle: " + vehicleNumber + ")", null);
    }

    private synchronized String generateUniqueTicketNumber() {
        long count = ticketRepository.count() + 1;
        String year = String.valueOf(LocalDateTime.now().getYear());
        return String.format("TV-%s-%06d", year, count);
    }

    public TicketDto mapToTicketDto(Ticket ticket) {
        if (ticket == null) return null;
        Violation v = ticket.getViolation();
        Vehicle vehicle = (v != null) ? v.getVehicle() : null;
        User owner = (vehicle != null) ? vehicle.getOwner() : null;
        User officer = (v != null) ? v.getOfficer() : null;
        ViolationType vType = (v != null) ? v.getViolationType() : null;

        List<Evidence> evidences = evidenceRepository.findByTicket(ticket);
        List<String> evidencePaths = (evidences != null)
                ? evidences.stream().map(Evidence::getFilePath).collect(Collectors.toList())
                : new ArrayList<>();

        Payment payment = paymentRepository.findByTicket(ticket).orElse(null);

        return TicketDto.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .violationId(v != null ? v.getId() : null)
                .vehicleNumber(vehicle != null ? vehicle.getVehicleNumber() : null)
                .vehicleType(vehicle != null ? vehicle.getVehicleType() : null)
                .ownerName(owner != null ? owner.getFullName() : null)
                .ownerPhone(owner != null ? owner.getPhone() : null)
                .categoryName(vType != null ? vType.getCategoryName() : null)
                .description(vType != null ? vType.getDescription() : null)
                .location(v != null ? v.getLocation() : null)
                .violationTime(v != null ? v.getViolationTime() : null)
                .officerNotes(v != null ? v.getOfficerNotes() : null)
                .officerName(officer != null ? officer.getFullName() : null)
                .officerUsername(officer != null ? officer.getUsername() : null)
                .fineAmount(ticket.getFineAmount())
                .paymentStatus(ticket.getPaymentStatus())
                .aiStatus(v != null ? v.getAiStatus() : null)
                .aiSuggestionRaw(v != null ? v.getAiSuggestionRaw() : null)
                .issuedAt(ticket.getIssuedAt())
                .evidenceFilePaths(evidencePaths)
                .paymentDetails(payment != null ? PaymentService.mapToPaymentDto(payment) : null)
                .build();
    }
}
