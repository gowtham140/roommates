package com.roomates.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.roomates.model.AuthUser;
import com.roomates.service.FeedbackService;
import com.roomates.webModel.ApiResponse;
import com.roomates.webModel.FeedbackRequest;
import com.roomates.webModel.FeedbackResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping("/feedback")
    public ResponseEntity<ApiResponse<Void>> submit(
            @Valid @RequestBody FeedbackRequest request,
            @AuthenticationPrincipal AuthUser principal) {

        feedbackService.submit(principal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Feedback submitted", null));
    }

    @GetMapping("/admin/feedback")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(feedbackService.getAll()));
    }
}
