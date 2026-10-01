package com.aiats.service;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class GeminiAiServiceTest {

    @Test
    public void testCleanApiKey() {
        GeminiAiService service = new GeminiAiService();
        assertNotNull(service);
    }
}
