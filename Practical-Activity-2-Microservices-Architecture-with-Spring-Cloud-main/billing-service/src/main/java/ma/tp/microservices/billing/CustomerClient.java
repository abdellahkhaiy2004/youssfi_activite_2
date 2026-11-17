package ma.tp.microservices.billing;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.PagedModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "CUSTOMER-SERVICE")
interface CustomerClient {
    @GetMapping(value = "/customers/{id}", produces = "application/hal+json")
    EntityModel<Customer> findById(@PathVariable("id") Long id);

    @GetMapping(value = "/customers", produces = "application/hal+json")
    PagedModel<Customer> findAll(@RequestParam("page") int page, @RequestParam("size") int size);
}
