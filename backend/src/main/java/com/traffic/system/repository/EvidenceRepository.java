package com.traffic.system.repository;

import com.traffic.system.entity.Evidence;
import com.traffic.system.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, Long> {
    List<Evidence> findByTicket(Ticket ticket);
    List<Evidence> findByTicketId(Long ticketId);
}
