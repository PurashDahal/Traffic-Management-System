package com.traffic.system.controller;

import com.traffic.system.service.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/**")
    public ResponseEntity<Resource> getFile(HttpServletRequest request) {
        String fullPath = request.getRequestURI();
        String filePath = fullPath.substring(fullPath.indexOf("/api/files/") + "/api/files/".length());

        Resource resource = fileStorageService.loadFileAsResource(filePath);

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // Default to octet-stream if type cannot be determined
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
