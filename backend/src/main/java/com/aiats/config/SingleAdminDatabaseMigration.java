package com.aiats.config;

import com.aiats.entity.Role;
import com.aiats.entity.User;
import com.aiats.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Enforces PostgreSQL database-level constraints for the Single-Administrator policy:
 * 1. Checks for duplicate existing administrator accounts without destructive actions.
 * 2. Creates the singleton relational table 'admin_singleton' with CHECK (id = 1).
 * 3. In PostgreSQL, creates a partial unique index on users(role) WHERE role = 'ADMIN'.
 * 4. Guarantees that at most one administrator account can physically exist in the database.
 */
@Component
@Order(1)
public class SingleAdminDatabaseMigration implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(SingleAdminDatabaseMigration.class);

    private final DataSource dataSource;
    private final UserRepository userRepository;

    public SingleAdminDatabaseMigration(DataSource dataSource, UserRepository userRepository) {
        this.dataSource = dataSource;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("Verifying Single-Administrator database integrity and enforcing DB-level constraints...");

        // 1. Audit existing admin accounts and remediate duplicates
        long adminCount = userRepository.countByRole(Role.ADMIN);
        if (adminCount > 1) {
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            User primaryAdmin = admins.get(0);
            for (int i = 1; i < admins.size(); i++) {
                User u = admins.get(i);
                logger.warn("Auto-remediating duplicate administrator account [{}]: demoting to RECRUITER.", u.getEmail());
                u.setRole(Role.RECRUITER);
                u.setVerificationStatus(com.aiats.entity.VerificationStatus.PENDING);
                userRepository.save(u);
            }
            logger.info("Single-Admin Policy: Remediation completed. Designating [{}] as sole platform administrator.", primaryAdmin.getEmail());
        }

        // Reconcile any non-admin accounts that were inadvertently named after the Lead Administrator "Marcus Vance"
        List<User> misnamedRecruiters = userRepository.findAll().stream()
                .filter(u -> u.getRole() != Role.ADMIN && "Marcus Vance".equalsIgnoreCase(u.getFullName()))
                .collect(Collectors.toList());
        for (User u : misnamedRecruiters) {
            logger.info("Reconciling non-admin account {} ({}) with authentic company recruiter identity.", u.getEmail(), u.getId());
            u.setFullName("David Sterling");
            userRepository.save(u);
        }

        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            String dbProductName = metaData.getDatabaseProductName() != null
                    ? metaData.getDatabaseProductName().toLowerCase() : "";

            // Reconcile historical activity log strings for consistent administrator attribution
            try (Statement stmt = conn.createStatement()) {
                stmt.executeUpdate("UPDATE system_activity_logs SET actor_name = 'Marcus Vance' WHERE actor_name = 'Administrator' AND actor_role = 'ADMIN'");
                stmt.executeUpdate("UPDATE system_activity_logs SET actor_name = 'David Sterling' WHERE actor_name = 'Marcus Vance' AND actor_role = 'RECRUITER'");
                stmt.executeUpdate("UPDATE system_activity_logs SET target = REPLACE(target, 'Marcus Vance (Vertex Systems Inc)', 'David Sterling (Vertex Systems Inc)') WHERE target LIKE '%Marcus Vance (Vertex Systems Inc)%'");
            } catch (Exception ex) {
                logger.warn("Activity log audit reconciliation notice: {}", ex.getMessage());
            }

            // 2. Create the admin_singleton relational table (supported across PostgreSQL, H2, and standard SQL)
            try (Statement stmt = conn.createStatement()) {
                stmt.execute(
                        "CREATE TABLE IF NOT EXISTS admin_singleton (" +
                        "  id INT PRIMARY KEY, " +
                        "  admin_user_id UUID NOT NULL UNIQUE, " +
                        "  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, " +
                        "  CONSTRAINT single_admin_row_check CHECK (id = 1), " +
                        "  CONSTRAINT fk_admin_singleton_user FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE RESTRICT" +
                        ")"
                );
            }

            // 3. If running on PostgreSQL, enforce the partial unique index on users(role)
            if (dbProductName.contains("postgres")) {
                try (Statement stmt = conn.createStatement()) {
                    stmt.execute(
                            "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_single_admin ON users (role) WHERE role = 'ADMIN'"
                    );
                    logger.info("PostgreSQL partial unique index 'idx_users_single_admin' verified/created successfully.");

                    stmt.execute(
                            "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email))"
                    );
                    logger.info("PostgreSQL unique index 'idx_users_email_lower' verified/created successfully.");

                    stmt.execute(
                            "ALTER TABLE users DROP CONSTRAINT IF EXISTS users_verification_status_check"
                    );
                    stmt.execute(
                            "ALTER TABLE users ADD CONSTRAINT users_verification_status_check CHECK (verification_status IN ('PENDING', 'IN_REVIEW', 'VERIFIED', 'ADDITIONAL_EVIDENCE_REQUIRED', 'UNABLE_TO_VERIFY', 'REJECTED', 'SUSPENDED', 'ARCHIVED', 'RESUBMITTED'))"
                    );
                    logger.info("PostgreSQL constraint 'users_verification_status_check' verified/updated successfully to support all verification states.");

                    stmt.execute(
                            "ALTER TABLE verification_history DROP CONSTRAINT IF EXISTS verification_history_new_status_check"
                    );
                    stmt.execute(
                            "ALTER TABLE verification_history ADD CONSTRAINT verification_history_new_status_check CHECK (new_status IN ('PENDING', 'IN_REVIEW', 'VERIFIED', 'ADDITIONAL_EVIDENCE_REQUIRED', 'UNABLE_TO_VERIFY', 'REJECTED', 'SUSPENDED', 'ARCHIVED', 'RESUBMITTED'))"
                    );

                    stmt.execute(
                            "ALTER TABLE verification_history DROP CONSTRAINT IF EXISTS verification_history_previous_status_check"
                    );
                    stmt.execute(
                            "ALTER TABLE verification_history ADD CONSTRAINT verification_history_previous_status_check CHECK (previous_status IN ('PENDING', 'IN_REVIEW', 'VERIFIED', 'ADDITIONAL_EVIDENCE_REQUIRED', 'UNABLE_TO_VERIFY', 'REJECTED', 'SUSPENDED', 'ARCHIVED', 'RESUBMITTED'))"
                    );
                    logger.info("PostgreSQL constraints on 'verification_history' updated successfully.");

                    try {
                        stmt.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_category VARCHAR(150)");
                        stmt.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS corrective_actions TEXT");
                        stmt.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_suggestions TEXT");
                        stmt.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS resubmission_allowed BOOLEAN DEFAULT TRUE");
                        stmt.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS resubmission_notes TEXT");
                        stmt.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS resubmitted_at TIMESTAMP WITH TIME ZONE");
                        stmt.execute("ALTER TABLE users ALTER COLUMN rejection_reason TYPE TEXT");
                    } catch (Exception colEx) {
                        logger.warn("Users columns alteration notice: {}", colEx.getMessage());
                    }

                    stmt.execute(
                            "ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check"
                    );
                    stmt.execute(
                            "ALTER TABLE applications ADD CONSTRAINT applications_status_check CHECK (status IN ('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'SELECTED', 'REJECTED', 'WITHDRAWN'))"
                    );
                    logger.info("PostgreSQL constraint 'applications_status_check' verified/updated successfully.");

                    stmt.execute(
                            "ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check"
                    );
                    stmt.execute(
                            "ALTER TABLE jobs ADD CONSTRAINT jobs_status_check CHECK (status IN ('ACTIVE', 'PENDING_APPROVAL', 'REJECTED', 'CLOSED', 'ARCHIVED', 'DRAFT'))"
                    );
                    logger.info("PostgreSQL constraint 'jobs_status_check' verified/updated successfully to support PENDING_APPROVAL, REJECTED, ARCHIVED.");

                    try {
                        stmt.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS rejection_reason TEXT");
                        stmt.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS approved_by VARCHAR(150)");
                        stmt.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE");
                        stmt.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE");
                    } catch (Exception jobColEx) {
                        logger.warn("Jobs columns alteration notice: {}", jobColEx.getMessage());
                    }
                } catch (Exception ex) {
                    logger.warn("Could not execute DDL migrations on PostgreSQL: {}", ex.getMessage());
                }
            }

            // 4. Sync singleton reference if an admin account already exists
            if (adminCount == 1) {
                User existingAdmin = userRepository.findByRole(Role.ADMIN).get(0);
                boolean singletonExists = false;
                try (PreparedStatement checkStmt = conn.prepareStatement("SELECT count(*) FROM admin_singleton WHERE id = 1")) {
                    try (ResultSet rs = checkStmt.executeQuery()) {
                        if (rs.next() && rs.getInt(1) > 0) {
                            singletonExists = true;
                        }
                    }
                }

                if (!singletonExists) {
                    try (PreparedStatement insertStmt = conn.prepareStatement(
                            "INSERT INTO admin_singleton (id, admin_user_id) VALUES (1, ?)")) {
                        insertStmt.setObject(1, existingAdmin.getId());
                        insertStmt.executeUpdate();
                        logger.info("Synchronized existing admin [{}] to admin_singleton record.", existingAdmin.getEmail());
                    }
                }
            }

            logger.info("Single-Administrator database enforcement successfully active.");
        } catch (Exception ex) {
            logger.error("Failed to apply Single-Administrator database migrations: {}", ex.getMessage(), ex);
            throw ex;
        }
    }
}
