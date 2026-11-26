package com.roomates.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.roomates.model.AuthUser;
import com.roomates.service.EnquiryService;
import com.roomates.webModel.ApiResponse;
import com.roomates.webModel.EnquiryRequest;
import com.roomates.webModel.EnquiryResponse;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
public class EnquiryController {

    private final EnquiryService enquiryService;

    public EnquiryController(EnquiryService enquiryService) {
        this.enquiryService = enquiryService;
    }

    @PostMapping("/api/rooms/{roomId}/enquiries")
    public ResponseEntity<ApiResponse<EnquiryResponse>> send(
            @PathVariable Integer roomId,
            @Valid @RequestBody EnquiryRequest request,
            @AuthenticationPrincipal AuthUser principal) {

        return ResponseEntity.ok(ApiResponse.ok("Enquiry sent",
                enquiryService.send(roomId, principal.getUserId(), request)));
    }

    @GetMapping("/api/enquiries/sent")
    public ResponseEntity<ApiResponse<List<EnquiryResponse>>> sent(
            @AuthenticationPrincipal AuthUser principal,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "100") @Min(1) @Max(100) int size) {

        return ResponseEntity.ok(ApiResponse.ok(enquiryService.sent(principal.getUserId(), page, size)));
    }

    @GetMapping("/api/enquiries/received")
    public ResponseEntity<ApiResponse<List<EnquiryResponse>>> received(
            @AuthenticationPrincipal AuthUser principal,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "100") @Min(1) @Max(100) int size) {

        return ResponseEntity.ok(ApiResponse.ok(enquiryService.received(principal.getUserId(), page, size)));
    }

    @GetMapping("/api/enquiries/count")
    public ResponseEntity<ApiResponse<Long>> countNew(@AuthenticationPrincipal AuthUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(enquiryService.countNewReceived(principal.getUserId())));
    }

    @PatchMapping("/api/enquiries/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Integer id,
            @RequestParam String status,
            @AuthenticationPrincipal AuthUser principal) {

        enquiryService.updateStatus(principal.getUserId(), id, status);
        return ResponseEntity.ok(ApiResponse.ok("Enquiry status updated", null));
    }
}
