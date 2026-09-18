package com.traffic.system.controller;

import com.traffic.system.service.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/**")
    public ResponseEntity<Resource> getFile(HttpServletRequest request) {
        String fullPath = request.getRequestURI();
        String prefix = "/api/files/";
        int idx = fullPath.indexOf(prefix);
        String filePath = (idx != -1) ? fullPath.substring(idx + prefix.length()) : fullPath;

        if (filePath.contains("?")) {
            filePath = filePath.substring(0, filePath.indexOf("?"));
        }

        try {
            filePath = URLDecoder.decode(filePath, StandardCharsets.UTF_8);
        } catch (Exception ignored) {}

        Resource resource = fileStorageService.loadFileAsResource(filePath);

        String contentType = null;
        try {
            Path path = resource.getFile().toPath();
            contentType = Files.probeContentType(path);
        } catch (Exception ignored) {}

        if (contentType == null) {
            try {
                contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            } catch (Exception ignored) {}
        }

        if (contentType == null) {
            String lower = filePath.toLowerCase();
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
                contentType = "image/jpeg";
            } else if (lower.endsWith(".png")) {
                contentType = "image/png";
            } else if (lower.endsWith(".webp")) {
                contentType = "image/webp";
            } else if (lower.endsWith(".gif")) {
                contentType = "image/gif";
            } else {
                contentType = "application/octet-stream";
            }
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .cacheControl(CacheControl.noCache().mustRevalidate())
                .body(resource);
    }
}
