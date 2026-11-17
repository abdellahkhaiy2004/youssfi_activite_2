package ma.tp.microservices.billing;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.PagedModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "INVENTORY-SERVICE")
interface ProductClient {
    @GetMapping(value = "/products/{id}", produces = "application/hal+json")
    EntityModel<Product> findById(@PathVariable("id") Long id);

    @GetMapping(value = "/products", produces = "application/hal+json")
    PagedModel<Product> findAll(@RequestParam("page") int page, @RequestParam("size") int size);
}
