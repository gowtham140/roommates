package com.roomates.serviceImp;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.roomates.exception.BadRequestException;
import com.roomates.service.FileStorageService;

@Service
public class FileStorageServiceImp implements FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageServiceImp.class);
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");
    private static final Pattern ROOM_IMAGE_URL = Pattern.compile("^/uploads/rooms/([A-Za-z0-9._-]+)$");
    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;
    private static final int MAX_FILES = 8;

    private final String uploadDir;

    public FileStorageServiceImp(@Value("${room.upload.dir}") String uploadDir) {
        this.uploadDir = uploadDir;
    }

    @Override
    public List<String> store(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new BadRequestException("No files provided");
        }
        if (files.size() > MAX_FILES) {
            throw new BadRequestException("You can upload at most 8 files at a time");
        }

        Path targetDir = Paths.get(uploadDir, "rooms");
        try {
            Files.createDirectories(targetDir);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not create upload directory", ex);
        }

        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                throw new BadRequestException("Uploaded file cannot be empty");
            }
            if (file.getSize() > MAX_FILE_SIZE) {
                throw new BadRequestException("Each image must be 5MB or smaller");
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
                throw new BadRequestException("Only image files are allowed");
            }

            String originalName = file.getOriginalFilename();
            int dotIndex = originalName == null ? -1 : originalName.lastIndexOf('.');
            if (dotIndex < 0 || dotIndex == originalName.length() - 1) {
                throw new BadRequestException("File must have a valid image extension");
            }
            String extension = originalName.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
            if (!ALLOWED_EXTENSIONS.contains(extension)) {
                throw new BadRequestException("Unsupported image extension. Allowed: jpg, jpeg, png, webp, gif");
            }

            String filename = UUID.randomUUID().toString() + "." + extension;
            Path destination = targetDir.resolve(filename);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destination);
            } catch (IOException ex) {
                throw new IllegalStateException("Failed to store uploaded image", ex);
            }
            urls.add("/uploads/rooms/" + filename);
        }
        return urls;
    }

    @Override
    public void delete(String url) {
        if (url == null) {
            return;
        }

        Matcher matcher = ROOM_IMAGE_URL.matcher(url.trim());
        if (!matcher.matches()) {
            return;
        }

        Path targetDir = Paths.get(uploadDir, "rooms").toAbsolutePath().normalize();
        Path file = targetDir.resolve(matcher.group(1)).normalize();
        if (!targetDir.equals(file.getParent())) {
            return;
        }

        try {
            Files.deleteIfExists(file);
        } catch (IOException ex) {
            log.warn("Could not delete uploaded image {}", file, ex);
            throw new IllegalStateException("Could not delete uploaded image", ex);
        }
    }
}
