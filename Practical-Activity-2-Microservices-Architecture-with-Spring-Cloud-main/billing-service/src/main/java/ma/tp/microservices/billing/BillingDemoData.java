package ma.tp.microservices.billing;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Configuration(proxyBeanMethods = false)
class BillingDemoData {
    @Bean
    CommandLineRunner seedBills(BillRepository repository) {
        return args -> {
            Bill first = new Bill(1L, Instant.parse("2026-10-22T10:00:00Z"));
            first.addItem(1L, 2, new BigDecimal("2490.00"));
            first.addItem(3L, 1, new BigDecimal("329.00"));

            Bill second = new Bill(1L, Instant.parse("2026-11-04T14:30:00Z"));
            second.addItem(4L, 1, new BigDecimal("1190.00"));
            second.addItem(2L, 1, new BigDecimal("749.00"));

            Bill third = new Bill(2L, Instant.parse("2026-11-02T11:45:00Z"));
            third.addItem(5L, 2, new BigDecimal("599.00"));
            third.addItem(6L, 3, new BigDecimal("349.00"));

            Bill fourth = new Bill(3L, Instant.parse("2026-11-10T09:20:00Z"));
            fourth.addItem(2L, 4, new BigDecimal("749.00"));

            repository.saveAll(List.of(first, second, third, fourth));
        };
    }
}
