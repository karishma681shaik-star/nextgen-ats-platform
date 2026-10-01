package com.aiats.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
public class RootController {

    private final DataSource dataSource;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public RootController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping(value = {"/", "/api"}, produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getRootHtml() {
        boolean dbOk = false;
        String dbName = "PostgreSQL";
        try (Connection conn = dataSource.getConnection()) {
            dbOk = true;
            dbName = conn.getMetaData().getDatabaseProductName() + " " + conn.getMetaData().getDatabaseProductVersion();
        } catch (Exception ignored) {}

        String html = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>AI ATS Recruitment Platform — Backend Engine</title>
              <style>
                body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #040711; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
                .card { max-width: 680px; width: 90%; background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 20px; padding: 36px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5), 0 0 30px rgba(99, 102, 241, 0.15); backdrop-filter: blur(16px); }
                .header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
                .badge-logo { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: bold; color: #fff; box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
                h1 { margin: 0; font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
                p.sub { margin: 4px 0 0; color: #94a3b8; font-size: 13px; font-family: monospace; }
                .status-row { display: flex; gap: 12px; margin: 24px 0; }
                .status-pill { flex: 1; padding: 14px 18px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); font-size: 13px; }
                .status-pill .label { color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 4px; }
                .status-pill .val { color: #10b981; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 6px; }
                .dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; }
                .btn-group { display: flex; gap: 12px; margin-top: 28px; }
                .btn { flex: 1; padding: 12px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; text-align: center; text-decoration: none; cursor: pointer; transition: all 0.2s; }
                .btn-primary { background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; border: 1px solid rgba(165, 180, 252, 0.3); box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4); }
                .btn-primary:hover { opacity: 0.95; transform: translateY(-1px); }
                .btn-secondary { background: rgba(255,255,255,0.06); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.12); }
                .btn-secondary:hover { background: rgba(255,255,255,0.1); color: #fff; }
                .credentials { margin-top: 24px; padding: 16px; background: rgba(0,0,0,0.3); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.12); font-size: 12px; color: #94a3b8; }
                .credentials table { width: 100%; border-collapse: collapse; margin-top: 8px; }
                .credentials th, .credentials td { text-align: left; padding: 4px 6px; font-family: monospace; font-size: 12px; }
                .credentials th { color: #a5b4fc; font-weight: 600; }
                .credentials td { color: #f8fafc; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <div class="badge-logo">&#9889;</div>
                  <div>
                    <h1>AI ATS Enterprise Backend Engine</h1>
                    <p class="sub">STATUS: OPERATIONAL &bull; PORT 8080 &bull; SPRING BOOT v3.3.4</p>
                  </div>
                </div>
                <div class="status-row">
                  <div class="status-pill">
                    <div class="label">Backend Service</div>
                    <div class="val"><span class="dot"></span> Online (HTTP 200)</div>
                  </div>
                  <div class="status-pill">
                    <div class="label">Database Engine</div>
                    <div class="val"><span class="dot"></span> {{DB_STATUS}}</div>
                  </div>
                </div>
                <div class="credentials">
                  <strong style="color: #cbd5e1;">Platform Active Credentials (Password: Password123!)</strong>
                  <table>
                    <tr><th>Role</th><th>Email</th><th>Password</th></tr>
                    <tr><td>Candidate</td><td>karishma681shaik@gmail.com</td><td>Password123!</td></tr>
                    <tr><td>Candidate</td><td>alex.rivera@example.com</td><td>Password123!</td></tr>
                    <tr><td>Recruiter</td><td>sarah.jenkins@cloudscale.io</td><td>Password123!</td></tr>
                    <tr><td>Admin</td><td>admin@ai-ats.internal</td><td>Password123!</td></tr>
                  </table>
                </div>
                <div class="btn-group">
                  <a href="{{FRONTEND_URL}}" class="btn btn-primary" target="_blank">Open Frontend Application (Port 5173) &rarr;</a>
                  <a href="/api/health" class="btn btn-secondary">JSON Health Check &rarr;</a>
                </div>
              </div>
            </body>
            </html>
            """
            .replace("{{DB_STATUS}}", dbOk ? "Connected (" + dbName + ")" : "Disconnected")
            .replace("{{FRONTEND_URL}}", frontendUrl);
        return ResponseEntity.ok(html);
    }

    @GetMapping(value = {"/", "/api"}, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getRootJson() {
        Map<String, Object> res = new HashMap<>();
        res.put("status", "UP");
        res.put("service", "AI ATS Enterprise Backend Engine");
        res.put("version", "1.0.0");
        res.put("port", 8080);
        res.put("frontendUrl", frontendUrl);
        res.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(res);
    }
}
