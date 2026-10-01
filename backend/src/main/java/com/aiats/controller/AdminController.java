package com.aiats.controller;

import com.aiats.dto.admin.AdminStatsDTO;
import com.aiats.dto.auth.UserDTO;
import com.aiats.dto.common.ApiResponse;
import com.aiats.security.UserPrincipal;
import com.aiats.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDTO>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getStats()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers(
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers(role)));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<UserDTO>> updateUserStatus(
            @PathVariable UUID userId,
            @RequestBody Map<String, String> body) {
        UserDTO updated = adminService.updateUserStatus(userId, body.get("status"));
        return ResponseEntity.ok(ApiResponse.success(updated, "User status updated"));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted"));
    }
}
