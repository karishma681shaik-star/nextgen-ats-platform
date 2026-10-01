package com.aiats.controller;

import com.aiats.dto.common.ApiResponse;
import com.aiats.dto.copilot.CopilotChatRequest;
import com.aiats.dto.copilot.CopilotChatResponse;
import com.aiats.entity.Role;
import com.aiats.security.UserPrincipal;
import com.aiats.service.CopilotService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/copilot")
public class CopilotController {

    private static final Logger log = LoggerFactory.getLogger(CopilotController.class);

    private final CopilotService copilotService;

    public CopilotController(CopilotService copilotService) {
        this.copilotService = copilotService;
    }

    /**
     * POST /api/copilot/chat
     *
     * Accepts the user's actual message, loads their real data from the database,
     * sends it to the AI provider, and returns a dynamic, personalized response.
     *
     * The user's identity and role are extracted from the JWT — never trusted
     * from the request body.
     */
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<CopilotChatResponse>> chat(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CopilotChatRequest request) {

        String safeUserId = principal != null && principal.getId() != null ? principal.getId().toString() : "anonymous";
        String roleStr = principal != null && principal.getRole() != null ? principal.getRole() : "UNKNOWN";
        int messageLength = request != null && request.getMessage() != null ? request.getMessage().length() : 0;

        log.info("COPILOT REQUEST RECEIVED: userId={} role={} messageLength={}", safeUserId, roleStr, messageLength);

        Role role;
        try {
            role = Role.valueOf(roleStr);
        } catch (IllegalArgumentException e) {
            log.error("COPILOT REQUEST FAILED: reason=Invalid user role: {}", roleStr);
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid user role"));
        }

        try {
            CopilotChatResponse response = copilotService.chat(
                    principal.getId(),
                    principal.getFullName(),
                    role,
                    request.getMessage(),
                    request.getContext()
            );

            log.info("COPILOT RESPONSE DELIVERED: userId={} success={}", safeUserId, response.isSuccess());
            return ResponseEntity.ok(ApiResponse.ok("Copilot response generated", response));

        } catch (Exception e) {
            log.error("COPILOT REQUEST FAILED: userId={} errorType={} message={}",
                safeUserId, e.getClass().getSimpleName(), e.getMessage(), e);
            
            String userFriendlyMessage = (e.getMessage() != null && !e.getMessage().isBlank())
                ? e.getMessage()
                : "TalentPilot AI is temporarily unavailable. Please check back shortly.";

            CopilotChatResponse errorResponse = new CopilotChatResponse(false, userFriendlyMessage, role.name());
            return ResponseEntity.ok(ApiResponse.ok("Copilot error", errorResponse));
        }
    }
}
