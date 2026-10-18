package com.aiats;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AiAtsApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiAtsApplication.class, args);
    }
}
