package com.traffic.system.repository;

import com.traffic.system.entity.Payment;
import com.traffic.system.entity.Ticket;
import com.traffic.system.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTicket(Ticket ticket);
    Optional<Payment> findByTicketId(Long ticketId);
    List<Payment> findByStatus(PaymentStatus status);
    Optional<Payment> findByTransactionId(String transactionId);
    Boolean existsByTransactionId(String transactionId);
}
