package com.aiats.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "AI ATS Enterprise Backend Engine");
        response.put("version", "1.0.0");
        response.put("timestamp", Instant.now().toString());

        Map<String, Object> dbHealth = new HashMap<>();
        try (Connection conn = dataSource.getConnection()) {
            dbHealth.put("status", "CONNECTED");
            dbHealth.put("database", conn.getMetaData().getDatabaseProductName());
            dbHealth.put("version", conn.getMetaData().getDatabaseProductVersion());
            response.put("database", dbHealth);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            dbHealth.put("status", "DISCONNECTED");
            dbHealth.put("error", e.getMessage());
            response.put("database", dbHealth);
            response.put("status", "DEGRADED");
            return ResponseEntity.status(503).body(response);
        }
    }
}
