package ma.tp.microservices.inventory;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.core.event.ValidatingRepositoryEventListener;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.validation.Validator;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

@Configuration(proxyBeanMethods = false)
class InventoryDataConfiguration implements RepositoryRestConfigurer {
    private final Validator validator;

    InventoryDataConfiguration(Validator validator) {
        this.validator = validator;
    }

    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
        config.exposeIdsFor(Product.class);
    }

    @Override
    public void configureValidatingRepositoryEventListener(ValidatingRepositoryEventListener listener) {
        listener.addValidator("beforeCreate", validator);
        listener.addValidator("beforeSave", validator);
    }

    @Bean
    CommandLineRunner seedProducts(ProductRepository repository) {
        return args -> repository.saveAll(List.of(
                new Product("Écran IPS 27 pouces", new BigDecimal("2490.00"), 18),
                new Product("Clavier mécanique", new BigDecimal("749.00"), 24),
                new Product("Souris sans fil", new BigDecimal("329.00"), 42),
                new Product("Station d’accueil USB-C", new BigDecimal("1190.00"), 12),
                new Product("Casque audio", new BigDecimal("599.00"), 28),
                new Product("Support d’ordinateur portable", new BigDecimal("349.00"), 31)
        ));
    }
}
