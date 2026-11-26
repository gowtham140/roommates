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

        List<ValidatedImage> validated = new ArrayList<>();
        for (MultipartFile file : files) {
            validated.add(validate(file));
        }

        Path targetDir = Paths.get(uploadDir, "rooms").toAbsolutePath().normalize();
        try {
            Files.createDirectories(targetDir);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not create upload directory", ex);
        }

        List<String> urls = new ArrayList<>();
        List<Path> written = new ArrayList<>();
        try {
            for (ValidatedImage image : validated) {
                String filename = UUID.randomUUID().toString() + "." + image.extension();
                Path destination = targetDir.resolve(filename);
                try (InputStream inputStream = image.file().getInputStream()) {
                    Files.copy(inputStream, destination);
                }
                written.add(destination);
                urls.add("/uploads/rooms/" + filename);
            }
            return urls;
        } catch (IOException | RuntimeException ex) {
            for (Path path : written) {
                try {
                    Files.deleteIfExists(path);
                } catch (IOException cleanupFailure) {
                    log.warn("Could not clean up uploaded image {}", path, cleanupFailure);
                }
            }
            if (ex instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }
            throw new IllegalStateException("Failed to store uploaded image", ex);
        }
    }

    private ValidatedImage validate(MultipartFile file) {
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

        byte[] header;
        try (InputStream inputStream = file.getInputStream()) {
            header = inputStream.readNBytes(12);
        } catch (IOException ex) {
            throw new BadRequestException("Could not read uploaded image");
        }

        String imageType = detectImageType(header);
        requireMatchingExtension(extension, imageType);
        requireMatchingContentType(contentType, imageType);
        return new ValidatedImage(file, extension, imageType);
    }

    private String detectImageType(byte[] header) {
        if (header.length >= 8 && header[0] == (byte) 0x89 && header[1] == 'P' && header[2] == 'N' && header[3] == 'G'
                && header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A) {
            return "png";
        }
        if (header.length >= 3 && header[0] == (byte) 0xFF && header[1] == (byte) 0xD8 && header[2] == (byte) 0xFF) {
            return "jpg";
        }
        if (header.length >= 6 && (matches(header, "GIF87a") || matches(header, "GIF89a"))) {
            return "gif";
        }
        if (header.length >= 12 && matches(header, "RIFF") && header[8] == 'W' && header[9] == 'E'
                && header[10] == 'B' && header[11] == 'P') {
            return "webp";
        }
        throw new BadRequestException("Uploaded file is not a supported image");
    }

    private boolean matches(byte[] header, String prefix) {
        byte[] expected = prefix.getBytes(java.nio.charset.StandardCharsets.US_ASCII);
        for (int i = 0; i < expected.length; i++) {
            if (header[i] != expected[i]) {
                return false;
            }
        }
        return true;
    }

    private void requireMatchingExtension(String extension, String imageType) {
        boolean valid = switch (imageType) {
            case "png" -> "png".equals(extension);
            case "jpg" -> "jpg".equals(extension) || "jpeg".equals(extension);
            case "gif" -> "gif".equals(extension);
            case "webp" -> "webp".equals(extension);
            default -> false;
        };
        if (!valid) {
            throw new BadRequestException("Image extension does not match the file content");
        }
    }

    private void requireMatchingContentType(String contentType, String imageType) {
        String normalized = contentType.split(";", 2)[0].trim().toLowerCase(Locale.ROOT);
        String expected = switch (imageType) {
            case "png" -> "image/png";
            case "jpg" -> "image/jpeg";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            default -> "";
        };
        if (!expected.equals(normalized)) {
            throw new BadRequestException("Image content type does not match the file content");
        }
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

    private record ValidatedImage(MultipartFile file, String extension, String imageType) {
    }
}
