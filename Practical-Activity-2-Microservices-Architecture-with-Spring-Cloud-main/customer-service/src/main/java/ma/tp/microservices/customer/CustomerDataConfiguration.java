package ma.tp.microservices.customer;

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
class CustomerDataConfiguration implements RepositoryRestConfigurer {
    private final Validator validator;

    CustomerDataConfiguration(Validator validator) {
        this.validator = validator;
    }

    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
        config.exposeIdsFor(Customer.class);
    }

    @Override
    public void configureValidatingRepositoryEventListener(ValidatingRepositoryEventListener listener) {
        listener.addValidator("beforeCreate", validator);
        listener.addValidator("beforeSave", validator);
    }

    @Bean
    CommandLineRunner seedCustomers(CustomerRepository repository) {
        return args -> repository.saveAll(List.of(
                new Customer("Salma El Amrani", "salma@example.com"),
                new Customer("Youssef Benali", "youssef@example.com"),
                new Customer("Nadia El Mansouri", "nadia@example.com"),
                new Customer("Amine Berrada", "amine@example.com")
        ));
    }
}
