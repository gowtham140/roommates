package com.roomates.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.roomates.model.AuthUser;
import com.roomates.service.AdminService;
import com.roomates.webModel.AdminUserResponse;
import com.roomates.webModel.ApiResponse;
import com.roomates.webModel.RoomResponse;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> users() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getUsers()));
    }

    @PatchMapping("/users/{id}/block")
    public ResponseEntity<ApiResponse<AdminUserResponse>> blockUser(
            @AuthenticationPrincipal AuthUser principal,
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok("User blocked",
                adminService.setUserBlocked(principal.getUserId(), id, true)));
    }

    @PatchMapping("/users/{id}/unblock")
    public ResponseEntity<ApiResponse<AdminUserResponse>> unblockUser(
            @AuthenticationPrincipal AuthUser principal,
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok("User unblocked",
                adminService.setUserBlocked(principal.getUserId(), id, false)));
    }

    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> rooms() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getRooms()));
    }

    @PatchMapping("/rooms/{id}/block")
    public ResponseEntity<ApiResponse<RoomResponse>> blockRoom(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok("Room blocked", adminService.setRoomBlocked(id, true)));
    }

    @PatchMapping("/rooms/{id}/unblock")
    public ResponseEntity<ApiResponse<RoomResponse>> unblockRoom(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok("Room unblocked", adminService.setRoomBlocked(id, false)));
    }
}
