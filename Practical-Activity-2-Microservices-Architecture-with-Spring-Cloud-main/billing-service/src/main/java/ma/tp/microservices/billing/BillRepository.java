package ma.tp.microservices.billing;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

interface BillRepository extends JpaRepository<Bill, Long> {
    @EntityGraph(attributePaths = "productItems")
    Optional<Bill> findWithItemsById(Long id);

    @EntityGraph(attributePaths = "productItems")
    List<Bill> findAllByCustomerIdOrderByBillingDateDescIdDesc(Long customerId);
}
