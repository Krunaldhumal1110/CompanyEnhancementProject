package com.company.intranet.config;

import com.company.intranet.repository.MachineRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataLoader {
    @Bean
    CommandLineRunner loadData(MachineRepository repo) {
        return args -> {
            // Optionally add initial data here
        };
    }
}
