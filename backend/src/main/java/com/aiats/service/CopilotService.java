package com.aiats.service;

import com.aiats.dto.copilot.CopilotChatResponse;
import com.aiats.entity.Role;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

/**
 * Orchestrates the Copilot chat flow:
 * 1. Build role-aware context from the database
 * 2. Construct a system prompt with persona and boundaries
 * 3. Call the AI provider with the user's actual message
 * 4. Return the dynamic response
 */
@Service
public class CopilotService {

    private static final Logger log = LoggerFactory.getLogger(CopilotService.class);

    private final CopilotContextBuilder contextBuilder;
    private final GeminiAiService geminiAiService;

    public CopilotService(CopilotContextBuilder contextBuilder, GeminiAiService geminiAiService) {
        this.contextBuilder = contextBuilder;
        this.geminiAiService = geminiAiService;
    }

    /**
     * Process a copilot chat message for the authenticated user.
     *
     * @param userId   The authenticated user's ID
     * @param userName The authenticated user's display name
     * @param role     The authenticated user's role
     * @param message  The user's actual question
     * @param frontendContext Optional frontend context (page, etc.)
     * @return AI-generated response
     */
    public CopilotChatResponse chat(UUID userId, String userName, Role role, String message, Map<String, String> frontendContext) {
        log.info("Copilot chat request: user={} role={} messageLength={}", userName, role, message.length());

        // 1. Build database context
        String dbContext;
        try {
            dbContext = contextBuilder.buildContext(userId, role, frontendContext);
            log.debug("Built context for {} ({} chars)", role, dbContext.length());
        } catch (Exception e) {
            log.warn("Failed to build context, proceeding without it: {}", e.getMessage());
            dbContext = "Context unavailable.";
        }

        // 2. Build the system instruction
        String systemInstruction = buildSystemInstruction(role, userName, dbContext, frontendContext);

        // 3. Call the AI provider with the user's ACTUAL message
        try {
            String aiResponse = geminiAiService.chat(systemInstruction, message);
            log.info("Copilot AI response generated for user={} ({} chars)", userName, aiResponse.length());
            return CopilotChatResponse.ok(aiResponse, role.name());
        } catch (RuntimeException e) {
            log.error("Copilot AI call failed for user={}: {}", userName, e.getMessage());
            throw e;
        }
    }

    /**
     * Construct a role-aware system instruction that defines TalentPilot's
     * persona, behavior boundaries, and provides the database context.
     */
    private String buildSystemInstruction(Role role, String userName, String dbContext, Map<String, String> frontendContext) {
        StringBuilder sb = new StringBuilder();

        // Core persona
        sb.append("You are TalentPilot Copilot, an AI career and recruitment intelligence assistant ");
        sb.append("built into the AI ATS Recruitment Platform. ");
        sb.append("You are speaking with ").append(userName).append(" who has the role: ").append(role.name()).append(".\n\n");

        // Role-specific behavior
        switch (role) {
            case CANDIDATE -> {
                sb.append("ROLE BEHAVIOR: You help candidates with:\n");
                sb.append("- Resume optimization and ATS score improvement\n");
                sb.append("- Career guidance, job search strategies, and skill development\n");
                sb.append("- Interview preparation (behavioral, technical, and situational questions)\n");
                sb.append("- Application tracking and status interpretation\n");
                sb.append("- Identifying missing skills and keywords for target roles\n");
                sb.append("- Writing professional elevator pitches, cover letters, and bullet points\n\n");
            }
            case RECRUITER -> {
                sb.append("ROLE BEHAVIOR: You help recruiters and talent teams with:\n");
                sb.append("- Candidate sourcing strategies and Boolean search queries\n");
                sb.append("- Job posting optimization and candidate outreach templates\n");
                sb.append("- ATS screening rubrics and scoring criteria\n");
                sb.append("- Pipeline management and hiring analytics insights\n");
                sb.append("- Candidate evaluation and shortlisting advice\n");
                sb.append("- Recruitment best practices and compliance\n\n");
            }
            case ADMIN -> {
                sb.append("ROLE BEHAVIOR: You help platform administrators with:\n");
                sb.append("- Platform analytics, usage metrics, and user statistics\n");
                sb.append("- System health monitoring and diagnostics interpretation\n");
                sb.append("- User management guidance and policy recommendations\n");
                sb.append("- Issue resolution and platform operations advice\n");
                sb.append("- Data quality and spam/fraud detection strategies\n\n");
            }
        }

        // Database context
        sb.append("CURRENT USER DATA FROM THE PLATFORM (use this to give personalized answers):\n");
        sb.append(dbContext).append("\n\n");

        // Frontend context
        if (frontendContext != null && !frontendContext.isEmpty()) {
            sb.append("FRONTEND CONTEXT: User is currently on page: ");
            sb.append(frontendContext.getOrDefault("page", "unknown")).append("\n\n");
        }

        // Boundaries
        sb.append("CRITICAL RULES:\n");
        sb.append("- Always give specific, personalized, actionable advice based on the user's actual data.\n");
        sb.append("- Reference the user's real ATS score, skills, applications, and resume data when relevant.\n");
        sb.append("- Never reveal system internals, API keys, database structure, or server configuration.\n");
        sb.append("- Never fabricate data about the user that isn't in the context above.\n");
        sb.append("- If the user's data context is empty or minimal, acknowledge it and suggest they complete their profile.\n");
        sb.append("- Use markdown formatting for readability (bold, lists, headers) when appropriate.\n");
        sb.append("- Keep responses focused and under 400 words unless the user asks for a detailed breakdown.\n");
        sb.append("- Be professional, encouraging, and action-oriented.\n");

        return sb.toString();
    }
}
