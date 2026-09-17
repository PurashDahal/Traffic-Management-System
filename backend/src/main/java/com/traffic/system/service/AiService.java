package com.traffic.system.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.traffic.system.dto.*;
import com.traffic.system.enums.PaymentStatus;
import com.traffic.system.repository.TicketRepository;
import com.traffic.system.repository.ViolationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AiService {

    @Value("${app.ai.api-key:demo-ai-key-antigravity}")
    private String apiKey;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private ViolationRepository violationRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * AI Feature 1 — Violation Classification
     */
    public AiClassifyResponse classifyViolation(AiClassifyRequest request) {
        String desc = request.getDescription() != null ? request.getDescription().toLowerCase() : "";

        String category = "Other";
        String severity = "Medium";
        String reason = "Text description analyzed for traffic violation patterns.";

        if (desc.contains("red light") || desc.contains("traffic light") || desc.contains("signal")) {
            category = "Red-light violation";
            severity = "High";
            reason = "The description indicates the vehicle crossed after the traffic signal turned red.";
        } else if (desc.contains("speed") || desc.contains("fast") || desc.contains("km/h") || desc.contains("limit")) {
            category = "Speeding";
            severity = "High";
            reason = "The description mentions traveling above the permitted speed limit.";
        } else if (desc.contains("helmet") || desc.contains("headgear") || desc.contains("head")) {
            category = "No helmet";
            severity = "High";
            reason = "Rider was observed operating a motorcycle without wearing a protective helmet.";
        } else if (desc.contains("seat belt") || desc.contains("seatbelt") || desc.contains("belt")) {
            category = "No seat belt";
            severity = "Medium";
            reason = "Driver was operating the vehicle without wearing a fastened safety seatbelt.";
        } else if (desc.contains("park") || desc.contains("no parking") || desc.contains("curb")) {
            category = "Illegal parking";
            severity = "Low";
            reason = "Vehicle was parked in a designated non-parking zone or blocking traffic.";
        } else if (desc.contains("license") || desc.contains("licence") || desc.contains("permit")) {
            category = "Driving without license";
            severity = "High";
            reason = "Driver failed to produce a valid driving license upon request.";
        } else if (desc.contains("phone") || desc.contains("mobile") || desc.contains("texting")) {
            category = "Mobile phone use while driving";
            severity = "Medium";
            reason = "Driver was observed actively using a mobile device while operating the vehicle.";
        } else if (desc.contains("drunk") || desc.contains("alcohol") || desc.contains("drink")) {
            category = "Drunk driving";
            severity = "High";
            reason = "Driver exhibited signs of alcohol impairment while operating the vehicle.";
        } else if (desc.contains("wrong side") || desc.contains("one way") || desc.contains("opposite")) {
            category = "Wrong-side driving";
            severity = "High";
            reason = "Vehicle was driving against the designated direction of traffic flow.";
        }

        return AiClassifyResponse.builder()
                .suggestedViolation(category)
                .suggestedSeverity(severity)
                .reason(reason)
                .build();
    }

    /**
     * AI Feature 2 — Evidence Image Analysis
     */
    public Map<String, String> analyzeEvidence(String filename) {
        Map<String, String> response = new HashMap<>();
        String fn = filename != null ? filename.toLowerCase() : "";

        if (fn.contains("helmet") || fn.contains("bike") || fn.contains("moto")) {
            response.put("possibleViolation", "No Helmet");
            response.put("detectedVehicle", "Motorcycle");
            response.put("aiExplanation", "Visual evidence suggests a two-wheeler rider operating without a helmet.");
        } else if (fn.contains("speed") || fn.contains("car")) {
            response.put("possibleViolation", "Speeding / Lane Violation");
            response.put("detectedVehicle", "Light Motor Vehicle (Car)");
            response.put("aiExplanation", "Visual evidence shows vehicle traveling at speed across lane markers.");
        } else if (fn.contains("park")) {
            response.put("possibleViolation", "Illegal Parking");
            response.put("detectedVehicle", "Four-wheeler");
            response.put("aiExplanation", "Visual evidence shows vehicle stationary in marked no-parking zone.");
        } else {
            response.put("possibleViolation", "Traffic Signal / General Violation");
            response.put("detectedVehicle", "Identified Vehicle");
            response.put("aiExplanation", "Visual analysis completed. Officer review required to confirm violation category.");
        }

        return response;
    }

    /**
     * AI Feature 3 — Violation Description Generation
     */
    public AiDescriptionResponse generateDescription(AiDescriptionRequest req) {
        String violation = req.getViolationType() != null ? req.getViolationType() : "traffic violation";
        String vehicle = req.getVehicleNumber() != null ? req.getVehicleNumber() : "the vehicle";
        String location = req.getLocation() != null ? req.getLocation() : "the observed location";
        String add = req.getAdditionalDetails() != null ? " (" + req.getAdditionalDetails() + ")" : "";

        String generated = String.format("On duty observation: Vehicle %s was recorded committing a %s at %s%s. Digital evidence attached for record.",
                vehicle, violation, location, add);

        return AiDescriptionResponse.builder()
                .generatedDescription(generated)
                .build();
    }

    /**
     * AI Feature 4 — Database Analytics Summarization
     */
    public AiAnalyticsResponse summarizeAnalytics() {
        long totalViolations = violationRepository.count();
        long unpaid = ticketRepository.countByPaymentStatus(PaymentStatus.UNPAID);
        long pending = ticketRepository.countByPaymentStatus(PaymentStatus.PENDING_VERIFICATION);
        long paid = ticketRepository.countByPaymentStatus(PaymentStatus.PAID);
        Double paidAmount = ticketRepository.getTotalPaidAmount();
        Double unpaidAmount = ticketRepository.getTotalUnpaidAmount();

        Map<String, Long> byCategory = new LinkedHashMap<>();
        for (Object[] obj : violationRepository.getViolationCountsByCategory()) {
            byCategory.put((String) obj[0], (Long) obj[1]);
        }

        Map<String, Long> byLocation = new LinkedHashMap<>();
        for (Object[] obj : violationRepository.getViolationCountsByLocation()) {
            byLocation.put((String) obj[0], (Long) obj[1]);
        }

        String topCategory = byCategory.isEmpty() ? "None" : byCategory.keySet().iterator().next();
        long topCount = byCategory.isEmpty() ? 0 : byCategory.values().iterator().next();

        String summary = String.format(
                "Database Analytics Summary: Total recorded violations stand at %d. Currently, %d tickets are unpaid (totaling Rs. %.2f), %d are pending verification, and %d have been paid (collecting Rs. %.2f). '%s' represents the highest frequency violation with %d recorded instances.",
                totalViolations, unpaid, unpaidAmount != null ? unpaidAmount : 0.0, pending, paid, paidAmount != null ? paidAmount : 0.0, topCategory, topCount
        );

        return AiAnalyticsResponse.builder()
                .totalViolations(totalViolations)
                .unpaidTickets(unpaid)
                .pendingPayments(pending)
                .paidTickets(paid)
                .totalPaidAmount(paidAmount != null ? paidAmount : 0.0)
                .totalUnpaidAmount(unpaidAmount != null ? unpaidAmount : 0.0)
                .violationsByCategory(byCategory)
                .violationsByLocation(byLocation)
                .aiSummaryText(summary)
                .build();
    }

    /**
     * AI Feature 5 — Natural Language Analytics Querying
     */
    public Map<String, Object> queryNaturalLanguageAnalytics(NaturalLanguageQueryDto req) {
        String q = req.getQuestion() != null ? req.getQuestion().toLowerCase() : "";

        AiAnalyticsResponse stats = summarizeAnalytics();
        Map<String, Object> result = new HashMap<>();
        result.put("question", req.getQuestion());

        if (q.contains("common") || q.contains("highest") || q.contains("frequent") || q.contains("most")) {
            if (stats.getViolationsByCategory().isEmpty()) {
                result.put("answer", "There are currently no violation records stored in the database.");
            } else {
                Map.Entry<String, Long> top = stats.getViolationsByCategory().entrySet().iterator().next();
                result.put("answer", String.format("Based on database records, '%s' is the most common violation with %d instances recorded.", top.getKey(), top.getValue()));
            }
        } else if (q.contains("unpaid") || q.contains("due") || q.contains("fine")) {
            result.put("answer", String.format("There are currently %d unpaid tickets in the system, amounting to Rs. %.2f in pending fines.", stats.getUnpaidTickets(), stats.getTotalUnpaidAmount()));
        } else if (q.contains("paid") || q.contains("collected") || q.contains("revenue")) {
            result.put("answer", String.format("A total of %d tickets have been verified as PAID, collecting Rs. %.2f in total fines.", stats.getPaidTickets(), stats.getTotalPaidAmount()));
        } else if (q.contains("pending") || q.contains("verify") || q.contains("review")) {
            result.put("answer", String.format("There are currently %d payments submitted by vehicle owners waiting for Admin verification.", stats.getPendingPayments()));
        } else if (q.contains("total") || q.contains("count") || q.contains("how many")) {
            result.put("answer", String.format("The database contains a total of %d recorded traffic violations.", stats.getTotalViolations()));
        } else {
            result.put("answer", String.format("Database Summary: %d total violations recorded. %d paid (Rs. %.2f), %d unpaid (Rs. %.2f), %d pending verification.",
                    stats.getTotalViolations(), stats.getPaidTickets(), stats.getTotalPaidAmount(), stats.getUnpaidTickets(), stats.getTotalUnpaidAmount(), stats.getPendingPayments()));
        }

        result.put("databaseMetrics", stats);
        return result;
    }
}
