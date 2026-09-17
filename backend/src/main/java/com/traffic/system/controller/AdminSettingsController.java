package com.traffic.system.controller;

import com.traffic.system.service.SystemSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AdminSettingsController {

    @Autowired
    private SystemSettingService systemSettingService;

    @GetMapping("/settings/public")
    public ResponseEntity<Map<String, String>> getPublicSettings() {
        return ResponseEntity.ok(systemSettingService.getPublicSettings());
    }

    @PostMapping(value = "/admin/settings/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadAppLogo(@RequestParam("file") MultipartFile logoFile) {
        String path = systemSettingService.uploadAppLogo(logoFile);
        return ResponseEntity.ok(Map.of("path", path, "message", "Web app logo uploaded successfully."));
    }

    @PostMapping(value = "/admin/settings/esewa-qr", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadEsewaQr(@RequestParam("file") MultipartFile qrFile) {
        String path = systemSettingService.uploadEsewaQr(qrFile);
        return ResponseEntity.ok(Map.of("path", path, "message", "Official eSewa payment QR code uploaded successfully."));
    }

    @DeleteMapping("/admin/settings/esewa-qr")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> removeEsewaQr() {
        systemSettingService.removeEsewaQr();
        return ResponseEntity.ok(Map.of("message", "Official eSewa QR code removed successfully."));
    }
}
