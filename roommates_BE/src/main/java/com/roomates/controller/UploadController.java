package com.roomates.controller;

import java.util.List;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.roomates.service.FileStorageService;
import com.roomates.service.FileStorageService.StoredObject;
import com.roomates.webModel.ApiResponse;

@RestController
public class UploadController {

    private final FileStorageService fileStorageService;

    public UploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/api/uploads")
    public ResponseEntity<ApiResponse<List<String>>> upload(@RequestParam("files") List<MultipartFile> files) {
        return ResponseEntity.ok(ApiResponse.ok(fileStorageService.store(files)));
    }

    @GetMapping("/uploads/rooms/{filename}")
    public ResponseEntity<byte[]> serve(@PathVariable String filename) {
        StoredObject object = fileStorageService.read("/uploads/rooms/" + filename);
        MediaType contentType = MediaType.parseMediaType(object.contentType());
        return ResponseEntity.ok()
                .contentType(contentType)
                .cacheControl(CacheControl.maxAge(365, java.util.concurrent.TimeUnit.DAYS).cachePublic().immutable())
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(object.content().length))
                .body(object.content());
    }
}
