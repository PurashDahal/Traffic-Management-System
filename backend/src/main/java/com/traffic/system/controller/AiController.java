package com.traffic.system.controller;

import com.traffic.system.dto.*;
import com.traffic.system.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @PostMapping("/classify-violation")
    public ResponseEntity<AiClassifyResponse> classifyViolation(@RequestBody AiClassifyRequest request) {
        return ResponseEntity.ok(aiService.classifyViolation(request));
    }

    @PostMapping("/analyze-evidence")
    public ResponseEntity<Map<String, String>> analyzeEvidence(@RequestParam("filename") String filename) {
        return ResponseEntity.ok(aiService.analyzeEvidence(filename));
    }

    @PostMapping("/generate-description")
    public ResponseEntity<AiDescriptionResponse> generateDescription(@RequestBody AiDescriptionRequest request) {
        return ResponseEntity.ok(aiService.generateDescription(request));
    }

    @GetMapping("/analytics-summary")
    public ResponseEntity<AiAnalyticsResponse> getAnalyticsSummary() {
        return ResponseEntity.ok(aiService.summarizeAnalytics());
    }

    @PostMapping("/natural-language-query")
    public ResponseEntity<Map<String, Object>> naturalLanguageQuery(@RequestBody NaturalLanguageQueryDto dto) {
        return ResponseEntity.ok(aiService.queryNaturalLanguageAnalytics(dto));
    }
}
