package com.gym.atlas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class GimnasioAtlasApplication {

    public static void main(String[] args) {
        SpringApplication.run(GimnasioAtlasApplication.class, args);
    }

}
