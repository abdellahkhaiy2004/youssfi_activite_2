package ma.tp.microservices.customer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

@RepositoryRestResource(path = "customers", collectionResourceRel = "customers")
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    @RestResource(path = "by-query", rel = "by-query")
    Page<Customer> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            @Param("name") String name, @Param("email") String email, Pageable pageable);
}
