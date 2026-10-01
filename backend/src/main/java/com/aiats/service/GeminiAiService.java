package com.aiats.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

/**
 * Calls the Google Gemini API with the user's message and role-aware context.
 * 
 * Features:
 * - Uses backend-only API key configuration (never exposed to client).
 * - Implements automatic model fallback if primary model returns 404 NOT_FOUND.
 * - Health check test on startup to verify connectivity.
 * - Parses detailed Google AI error messages cleanly.
 */
@Service
public class GeminiAiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    @Value("${app.gemini.model:gemini-1.5-flash}")
    private String model;

    public GeminiAiService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @PostConstruct
    public void init() {
        String cleanKey = getCleanApiKey();
        boolean isConfigured = !cleanKey.isBlank() && !cleanKey.contains("YOUR_GEMINI_API_KEY");
        log.info("Gemini API key configured: {}", isConfigured);
        log.info("Gemini AI model configured: {}", model);

        if (isConfigured) {
            try {
                log.info("GEMINI HEALTH TEST STARTED");
                String testRes = testDirectConnection(cleanKey);
                log.info("GEMINI HEALTH CHECK RESULT: {}", testRes);
            } catch (Exception e) {
                log.error("GEMINI HEALTH CHECK FAILED: errorType={} message={}", e.getClass().getSimpleName(), e.getMessage());
            }
        }
    }

    private String getCleanApiKey() {
        if (apiKey == null) return "";
        String trimmed = apiKey.trim();
        if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
            trimmed = trimmed.substring(1, trimmed.length() - 1);
        } else if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
            trimmed = trimmed.substring(1, trimmed.length() - 1);
        }
        return trimmed;
    }

    private String testDirectConnection(String cleanKey) {
        String testUrl = "https://generativelanguage.googleapis.com/v1beta/models?key=" + cleanKey;

        try {
            ResponseEntity<String> response = restTemplate.exchange(testUrl, HttpMethod.GET, null, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode modelsNode = root.path("models");
                if (modelsNode.isArray() && !modelsNode.isEmpty()) {
                    log.info("Gemini AI connection verified successfully (found {} models)", modelsNode.size());
                    return "GEMINI_CONNECTION_OK";
                }
            }
        } catch (Exception e) {
            log.warn("Gemini health test check notice: {}", e.getMessage());
        }
        return "UNKNOWN_RESPONSE";
    }

    /**
     * Send a message to the Gemini API and return the generated text response.
     *
     * @param systemInstruction The role-aware system prompt
     * @param userMessage       The user's actual question/message
     * @return The AI-generated response text
     * @throws RuntimeException if the API call fails
     */
    public String chat(String systemInstruction, String userMessage) {
        String cleanKey = getCleanApiKey();
        if (cleanKey.isBlank() || cleanKey.contains("YOUR_GEMINI_API_KEY")) {
            log.error("GEMINI REQUEST FAILED: reason=API key not configured");
            throw new RuntimeException(
                "Gemini API key is not configured. Copy your API key (starting with AIzaSy) from Google AI Studio into backend/.env."
            );
        }

        // Build list of candidate models with fallback
        List<String> candidateModels = new ArrayList<>();
        if (model != null && !model.isBlank()) {
            candidateModels.add(model.trim());
        }
        if (!candidateModels.contains("gemini-2.5-flash")) candidateModels.add("gemini-2.5-flash");
        if (!candidateModels.contains("gemini-3.5-flash")) candidateModels.add("gemini-3.5-flash");
        if (!candidateModels.contains("gemini-1.5-flash")) candidateModels.add("gemini-1.5-flash");
        if (!candidateModels.contains("gemini-1.5-pro")) candidateModels.add("gemini-1.5-pro");

        HttpStatusCodeException lastStatusException = null;

        for (String targetModel : candidateModels) {
            log.info("GEMINI REQUEST STARTED: model={}", targetModel);
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + targetModel + ":generateContent?key=" + cleanKey;

            try {
                ObjectNode requestBody = objectMapper.createObjectNode();

                // System instruction
                if (systemInstruction != null && !systemInstruction.isBlank()) {
                    ObjectNode systemInstructionNode = objectMapper.createObjectNode();
                    ObjectNode systemPart = objectMapper.createObjectNode();
                    systemPart.put("text", systemInstruction);
                    ArrayNode systemParts = objectMapper.createArrayNode();
                    systemParts.add(systemPart);
                    systemInstructionNode.set("parts", systemParts);
                    requestBody.set("system_instruction", systemInstructionNode);
                }

                // User message content
                ArrayNode contents = objectMapper.createArrayNode();
                ObjectNode userContent = objectMapper.createObjectNode();
                userContent.put("role", "user");
                ObjectNode userPart = objectMapper.createObjectNode();
                userPart.put("text", userMessage != null ? userMessage : "");
                ArrayNode userParts = objectMapper.createArrayNode();
                userParts.add(userPart);
                userContent.set("parts", userParts);
                contents.add(userContent);
                requestBody.set("contents", contents);

                // Generation config
                ObjectNode genConfig = objectMapper.createObjectNode();
                genConfig.put("temperature", 0.7);
                genConfig.put("topP", 0.95);
                genConfig.put("topK", 40);
                genConfig.put("maxOutputTokens", 1024);
                requestBody.set("generationConfig", genConfig);

                String jsonBody = objectMapper.writeValueAsString(requestBody);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

                ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

                log.info("GEMINI RESPONSE RECEIVED: status={}", response.getStatusCode());

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode responseJson = objectMapper.readTree(response.getBody());
                    
                    JsonNode candidates = responseJson.path("candidates");
                    if (candidates.isArray() && !candidates.isEmpty()) {
                        JsonNode content = candidates.get(0).path("content");
                        JsonNode partsNode = content.path("parts");
                        if (partsNode.isArray() && !partsNode.isEmpty()) {
                            String text = partsNode.get(0).path("text").asText("");
                            log.info("Gemini API returned generated text successfully ({} chars)", text.length());
                            return text;
                        }
                    }

                    JsonNode promptFeedback = responseJson.path("promptFeedback");
                    if (promptFeedback.has("blockReason")) {
                        String reason = promptFeedback.path("blockReason").asText("UNKNOWN");
                        log.warn("GEMINI REQUEST FAILED: blockReason={}", reason);
                        throw new RuntimeException("AI content was filtered. Please rephrase your question.");
                    }

                    log.error("GEMINI REQUEST FAILED: Unexpected response structure");
                    throw new RuntimeException("Could not parse AI response.");
                }

            } catch (HttpStatusCodeException e) {
                lastStatusException = e;
                log.error("GEMINI REQUEST FAILED: model={} status={} errorType={} message={}",
                    targetModel, e.getStatusCode(), e.getClass().getSimpleName(), e.getMessage());

                if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                    log.warn("Model '{}' returned 404 NOT_FOUND. Attempting fallback model...", targetModel);
                    continue;
                }

                String errResponseBody = e.getResponseBodyAsString();
                if (errResponseBody.contains("API_KEY_INVALID") || errResponseBody.contains("API key not valid")) {
                    throw new RuntimeException("Gemini API Key is invalid or expired. Copy a valid key starting with 'AIzaSy' from Google AI Studio into backend/.env.");
                }

                // Try to extract Google error message if present
                try {
                    JsonNode errJson = objectMapper.readTree(errResponseBody);
                    String detailedMsg = errJson.path("error").path("message").asText("");
                    if (!detailedMsg.isBlank()) {
                        throw new RuntimeException("Gemini API Error: " + detailedMsg);
                    }
                } catch (RuntimeException re) {
                    throw re;
                } catch (Exception ignored) {}

                throw new RuntimeException("AI provider error (HTTP " + e.getStatusCode() + ").");
            } catch (RuntimeException e) {
                throw e;
            } catch (Exception e) {
                log.error("GEMINI REQUEST FAILED: errorType={} message={}", e.getClass().getSimpleName(), e.getMessage());
                throw new RuntimeException("Failed to connect to AI service: " + e.getMessage());
            }
        }

        if (lastStatusException != null) {
            log.error("All candidate Gemini models failed with status {}", lastStatusException.getStatusCode());
        }
        throw new RuntimeException("Gemini AI service unavailable.");
    }
}
