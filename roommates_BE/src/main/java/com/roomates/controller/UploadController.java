package com.roomates.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.roomates.service.FileStorageService;
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
}
