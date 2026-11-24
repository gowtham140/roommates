package com.roomates.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.roomates.model.AuthUser;
import com.roomates.service.ReportService;
import com.roomates.webModel.ApiResponse;
import com.roomates.webModel.ReportRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> submit(
            @Valid @RequestBody ReportRequest request,
            @AuthenticationPrincipal AuthUser principal) {

        reportService.submit(principal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Report submitted", null));
    }
}
