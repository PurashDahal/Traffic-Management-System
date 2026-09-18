package com.traffic.system.service;

import com.traffic.system.exception.FileStorageException;
import com.traffic.system.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "webp", "gif");

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new FileStorageException("Could not create directory where uploaded files will be stored: " + this.fileStorageLocation);
        }
    }

    public String storeFile(MultipartFile file, String subDirectory) {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException("Failed to store empty file.");
        }

        String rawFilename = file.getOriginalFilename() != null && !file.getOriginalFilename().trim().isEmpty()
                ? file.getOriginalFilename().trim()
                : "upload.jpg";

        String originalFilename = StringUtils.cleanPath(rawFilename);
        String extension = getFileExtension(originalFilename);

        if (extension.isEmpty() && file.getContentType() != null) {
            String mime = file.getContentType().toLowerCase();
            if (mime.contains("jpeg") || mime.contains("jpg")) extension = "jpg";
            else if (mime.contains("png")) extension = "png";
            else if (mime.contains("webp")) extension = "webp";
            else if (mime.contains("gif")) extension = "gif";
        }

        if (extension.isEmpty()) {
            extension = "jpg";
        }

        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new FileStorageException("Invalid file type (" + extension + "). Only JPG, JPEG, PNG, WEBP, and GIF are allowed.");
        }

        // Sanitize base name to prevent URL space/character encoding issues
        String baseName = originalFilename;
        int dotIndex = baseName.lastIndexOf(".");
        if (dotIndex != -1) {
            baseName = baseName.substring(0, dotIndex);
        }
        String cleanBaseName = baseName.replaceAll("\\s+", "_").replaceAll("[^a-zA-Z0-9_-]", "");
        if (cleanBaseName.isEmpty()) {
            cleanBaseName = "file";
        }
        String finalFilename = cleanBaseName + "." + extension.toLowerCase();

        try {
            Path targetDir = this.fileStorageLocation;
            if (subDirectory != null && !subDirectory.trim().isEmpty()) {
                targetDir = this.fileStorageLocation.resolve(subDirectory.trim());
                Files.createDirectories(targetDir);
            }

            String storedFileName = UUID.randomUUID().toString() + "_" + finalFilename;
            Path targetLocation = targetDir.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return (subDirectory != null && !subDirectory.trim().isEmpty() ? subDirectory.trim() + "/" : "") + storedFileName;
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + originalFilename + ". Please try again!");
        }
    }

    public Resource loadFileAsResource(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) {
            throw new ResourceNotFoundException("File name is empty.");
        }

        String rawCleaned = fileName.trim();
        // Remove leading slashes and uploads/ prefix if present
        while (rawCleaned.startsWith("/")) {
            rawCleaned = rawCleaned.substring(1);
        }
        if (rawCleaned.startsWith("uploads/")) {
            rawCleaned = rawCleaned.substring("uploads/".length());
        }

        List<String> candidateNames = new ArrayList<>();
        candidateNames.add(rawCleaned);
        try {
            String decoded = URLDecoder.decode(rawCleaned, StandardCharsets.UTF_8);
            if (!candidateNames.contains(decoded)) {
                candidateNames.add(decoded);
            }
        } catch (Exception ignored) {}

        List<Path> candidateBaseDirs = new ArrayList<>();
        candidateBaseDirs.add(this.fileStorageLocation);
        candidateBaseDirs.add(Paths.get("uploads").toAbsolutePath().normalize());
        candidateBaseDirs.add(Paths.get("backend/uploads").toAbsolutePath().normalize());
        candidateBaseDirs.add(Paths.get(System.getProperty("user.dir"), "uploads").normalize());
        candidateBaseDirs.add(Paths.get(System.getProperty("user.dir"), "backend/uploads").normalize());
        if (this.fileStorageLocation.getParent() != null) {
            candidateBaseDirs.add(this.fileStorageLocation.getParent().resolve("uploads").normalize());
            candidateBaseDirs.add(this.fileStorageLocation.getParent().resolve("backend/uploads").normalize());
        }

        for (Path baseDir : candidateBaseDirs) {
            for (String candName : candidateNames) {
                try {
                    Path filePath = baseDir.resolve(candName).normalize();
                    if (Files.exists(filePath) && Files.isReadable(filePath) && !Files.isDirectory(filePath)) {
                        Resource resource = new UrlResource(filePath.toUri());
                        if (resource.exists() && resource.isReadable()) {
                            return resource;
                        }
                    }
                } catch (Exception ignored) {}
            }
        }

        throw new ResourceNotFoundException("File not found on server: " + fileName);
    }

    public void deleteFile(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) return;
        try {
            String rawCleaned = fileName.trim();
            while (rawCleaned.startsWith("/")) rawCleaned = rawCleaned.substring(1);
            if (rawCleaned.startsWith("uploads/")) rawCleaned = rawCleaned.substring("uploads/".length());

            List<Path> candidateBaseDirs = new ArrayList<>();
            candidateBaseDirs.add(this.fileStorageLocation);
            candidateBaseDirs.add(Paths.get("uploads").toAbsolutePath().normalize());
            candidateBaseDirs.add(Paths.get("backend/uploads").toAbsolutePath().normalize());
            if (this.fileStorageLocation.getParent() != null) {
                candidateBaseDirs.add(this.fileStorageLocation.getParent().resolve("uploads").normalize());
                candidateBaseDirs.add(this.fileStorageLocation.getParent().resolve("backend/uploads").normalize());
            }

            for (Path baseDir : candidateBaseDirs) {
                try {
                    Path filePath = baseDir.resolve(rawCleaned).normalize();
                    if (Files.exists(filePath)) {
                        Files.deleteIfExists(filePath);
                    }
                } catch (Exception ignored) {}
            }
        } catch (Exception ignored) {
            // Ignore cleanup failure
        }
    }

    private String getFileExtension(String filename) {
        int lastIndexOf = filename.lastIndexOf(".");
        if (lastIndexOf == -1) {
            return "";
        }
        return filename.substring(lastIndexOf + 1);
    }
}
