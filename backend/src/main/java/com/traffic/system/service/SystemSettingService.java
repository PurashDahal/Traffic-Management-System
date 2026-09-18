package com.traffic.system.service;

import com.traffic.system.entity.SystemSetting;
import com.traffic.system.entity.User;
import com.traffic.system.enums.RoleName;
import com.traffic.system.exception.UnauthorizedException;
import com.traffic.system.repository.SystemSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class SystemSettingService {

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private AuthService authService;

    @Autowired
    private AuditLogService auditLogService;

    public static final String KEY_APP_LOGO = "APP_LOGO_PATH";
    public static final String KEY_ESEWA_QR = "ESEWA_QR_PATH";
    public static final String KEY_SYSTEM_NAME = "SYSTEM_NAME";

    public Map<String, String> getPublicSettings() {
        Map<String, String> settings = new HashMap<>();

        systemSettingRepository.findBySettingKey(KEY_APP_LOGO)
                .ifPresent(s -> settings.put(KEY_APP_LOGO, s.getSettingValue()));

        systemSettingRepository.findBySettingKey(KEY_ESEWA_QR)
                .ifPresent(s -> settings.put(KEY_ESEWA_QR, s.getSettingValue()));

        systemSettingRepository.findBySettingKey(KEY_SYSTEM_NAME)
                .ifPresentOrElse(
                        s -> settings.put(KEY_SYSTEM_NAME, s.getSettingValue()),
                        () -> settings.put(KEY_SYSTEM_NAME, "AI Digital Traffic Violation System")
                );

        return settings;
    }

    public String uploadAppLogo(MultipartFile logoFile) {
        User admin = authService.getCurrentUser();
        if (admin.getRole() != RoleName.ADMIN) {
            throw new UnauthorizedException("Only Admin can upload web application logo.");
        }

        // Clean up previous logo file if existed
        systemSettingRepository.findBySettingKey(KEY_APP_LOGO).ifPresent(s -> {
            if (s.getSettingValue() != null) {
                fileStorageService.deleteFile(s.getSettingValue());
            }
        });

        String filePath = fileStorageService.storeFile(logoFile, "settings");
        saveOrUpdateSetting(KEY_APP_LOGO, filePath, admin);

        auditLogService.logAction(admin, "LOGO_UPDATED", "SystemSetting", KEY_APP_LOGO, "Uploaded new Web App Logo", null);
        return filePath;
    }

    public String uploadEsewaQr(MultipartFile qrFile) {
        User admin = authService.getCurrentUser();
        if (admin.getRole() != RoleName.ADMIN) {
            throw new UnauthorizedException("Only Admin can upload or replace official eSewa QR code.");
        }

        // Clean up previous QR file if existed
        systemSettingRepository.findBySettingKey(KEY_ESEWA_QR).ifPresent(s -> {
            if (s.getSettingValue() != null) {
                fileStorageService.deleteFile(s.getSettingValue());
            }
        });

        String filePath = fileStorageService.storeFile(qrFile, "settings");
        saveOrUpdateSetting(KEY_ESEWA_QR, filePath, admin);

        auditLogService.logAction(admin, "QR_UPDATED", "SystemSetting", KEY_ESEWA_QR, "Uploaded/Replaced official eSewa Payment QR", null);
        return filePath;
    }

    public void removeEsewaQr() {
        User admin = authService.getCurrentUser();
        if (admin.getRole() != RoleName.ADMIN) {
            throw new UnauthorizedException("Only Admin can remove eSewa QR code.");
        }

        Optional<SystemSetting> setting = systemSettingRepository.findBySettingKey(KEY_ESEWA_QR);
        if (setting.isPresent()) {
            fileStorageService.deleteFile(setting.get().getSettingValue());
            systemSettingRepository.delete(setting.get());
            auditLogService.logAction(admin, "QR_REMOVED", "SystemSetting", KEY_ESEWA_QR, "Removed official eSewa QR code", null);
        }
    }

    private void saveOrUpdateSetting(String key, String value, User admin) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                .orElse(SystemSetting.builder().settingKey(key).build());
        setting.setSettingValue(value);
        setting.setUpdatedBy(admin);
        systemSettingRepository.save(setting);
    }
}
