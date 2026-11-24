package com.roomates.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.roomates.model.AuthUser;
import com.roomates.service.RoomService;
import com.roomates.webModel.ApiResponse;
import com.roomates.webModel.RoomRequest;
import com.roomates.webModel.RoomResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<RoomResponse>>> search(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal minRent,
            @RequestParam(required = false) BigDecimal maxRent,
            @RequestParam(required = false) String roomType,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) Boolean food,
            @RequestParam(required = false) String foodPreference,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        return ResponseEntity.ok(ApiResponse.ok(
                roomService.search(location, minRent, maxRent, roomType, gender, food, foodPreference, page, size, sort)));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> mine(@AuthenticationPrincipal AuthUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(roomService.getMine(principal.getUserId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomResponse>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(roomService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoomResponse>> create(
            @Valid @RequestBody RoomRequest request,
            @AuthenticationPrincipal AuthUser principal) {

        return ResponseEntity.ok(ApiResponse.ok("Room created", roomService.create(principal.getUserId(), request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomResponse>> update(
            @PathVariable Integer id,
            @Valid @RequestBody RoomRequest request,
            @AuthenticationPrincipal AuthUser principal) {

        return ResponseEntity.ok(ApiResponse.ok("Room updated",
                roomService.update(principal.getUserId(), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Integer id,
            @AuthenticationPrincipal AuthUser principal) {

        roomService.delete(principal.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Room deleted", null));
    }
}
