package com.traffic.system.repository;

import com.traffic.system.entity.Ticket;
import com.traffic.system.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByTicketNumber(String ticketNumber);
    List<Ticket> findByPaymentStatus(PaymentStatus status);
    List<Ticket> findByViolationVehicleOwnerId(Long ownerId);
    List<Ticket> findByViolationOfficerId(Long officerId);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.paymentStatus = :status")
    long countByPaymentStatus(PaymentStatus status);

    @Query("SELECT COALESCE(SUM(t.fineAmount), 0) FROM Ticket t WHERE t.paymentStatus = 'PAID'")
    Double getTotalPaidAmount();

    @Query("SELECT COALESCE(SUM(t.fineAmount), 0) FROM Ticket t WHERE t.paymentStatus = 'UNPAID'")
    Double getTotalUnpaidAmount();
}
