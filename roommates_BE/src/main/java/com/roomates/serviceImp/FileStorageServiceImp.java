package com.roomates.serviceImp;

import java.io.IOException;
import java.io.InputStream;
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
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.roomates.exception.BadRequestException;
import com.roomates.exception.ResourceNotFoundException;
import com.roomates.service.FileStorageService;

import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class FileStorageServiceImp implements FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageServiceImp.class);
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");
    private static final Pattern ROOM_IMAGE_URL = Pattern.compile("^/uploads/rooms/([A-Za-z0-9._-]+)$");
    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;
    private static final int MAX_FILES = 8;
    private static final String KEY_PREFIX = "rooms/";
    private static final String URL_PREFIX = "/uploads/rooms/";

    private final S3Client s3Client;
    private final String bucket;

    public FileStorageServiceImp(S3Client s3Client, @Value("${storage.s3.bucket}") String bucket) {
        if (!StringUtils.hasText(bucket)) {
            throw new IllegalStateException("STORAGE_BUCKET is required");
        }
        this.s3Client = s3Client;
        this.bucket = bucket;
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

        List<String> urls = new ArrayList<>();
        List<String> writtenKeys = new ArrayList<>();
        try {
            for (ValidatedImage image : validated) {
                byte[] bytes = readAllBytes(image.file());
                String filename = UUID.randomUUID().toString() + "." + image.extension();
                String key = KEY_PREFIX + filename;
                s3Client.putObject(
                        PutObjectRequest.builder()
                                .bucket(bucket)
                                .key(key)
                                .contentType(contentType(image.imageType()))
                                .build(),
                        RequestBody.fromBytes(bytes));
                writtenKeys.add(key);
                urls.add(URL_PREFIX + filename);
            }
            return urls;
        } catch (RuntimeException ex) {
            deleteUploadedKeys(writtenKeys);
            throw ex;
        } catch (IOException ex) {
            deleteUploadedKeys(writtenKeys);
            throw new IllegalStateException("Failed to store uploaded image", ex);
        }
    }

    @Override
    public StoredObject read(String url) {
        String key = requireKey(url);
        try (ResponseInputStream<GetObjectResponse> stream = s3Client.getObject(
                GetObjectRequest.builder().bucket(bucket).key(key).build())) {
            String contentType = StringUtils.hasText(stream.response().contentType())
                    ? stream.response().contentType()
                    : contentTypeFromKey(key);
            return new StoredObject(stream.readAllBytes(), contentType);
        } catch (NoSuchKeyException ex) {
            throw new ResourceNotFoundException("Image not found");
        } catch (IOException ex) {
            throw new IllegalStateException("Could not read uploaded image", ex);
        }
    }

    @Override
    public void delete(String url) {
        String key = findKey(url);
        if (key == null) {
            return;
        }
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
        } catch (RuntimeException ex) {
            log.warn("Could not delete uploaded image {}", key, ex);
            throw new IllegalStateException("Could not delete uploaded image", ex);
        }
    }

    private void deleteUploadedKeys(List<String> keys) {
        for (String key : keys) {
            try {
                s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
            } catch (RuntimeException ex) {
                log.warn("Could not clean up uploaded object {}", key, ex);
            }
        }
    }

    private String findKey(String url) {
        if (url == null) {
            return null;
        }
        Matcher matcher = ROOM_IMAGE_URL.matcher(url.trim());
        if (!matcher.matches()) {
            return null;
        }
        String filename = matcher.group(1);
        if (filename.contains("..")) {
            return null;
        }
        return KEY_PREFIX + filename;
    }

    private String requireKey(String url) {
        String key = findKey(url);
        if (key == null) {
            throw new ResourceNotFoundException("Image not found");
        }
        return key;
    }

    private byte[] readAllBytes(MultipartFile file) throws IOException {
        try (InputStream inputStream = file.getInputStream()) {
            return inputStream.readAllBytes();
        }
    }

    private String contentTypeFromKey(String key) {
        String filename = key.substring(KEY_PREFIX.length());
        int dotIndex = filename.lastIndexOf('.');
        String extension = dotIndex < 0 ? "" : filename.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
        return switch (extension) {
            case "png" -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            default -> "application/octet-stream";
        };
    }

    private String contentType(String imageType) {
        return switch (imageType) {
            case "png" -> "image/png";
            case "jpg" -> "image/jpeg";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            default -> "application/octet-stream";
        };
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
        String expected = contentType(imageType);
        if (!expected.equals(normalized)) {
            throw new BadRequestException("Image content type does not match the file content");
        }
    }

    private record ValidatedImage(MultipartFile file, String extension, String imageType) {
    }
}
