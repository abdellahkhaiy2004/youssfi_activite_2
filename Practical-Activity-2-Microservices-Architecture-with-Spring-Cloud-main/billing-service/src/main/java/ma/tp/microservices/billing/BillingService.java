package ma.tp.microservices.billing;

import feign.FeignException;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Supplier;

@Service
class BillingService {
    private final BillRepository bills;
    private final CustomerClient customers;
    private final ProductClient products;

    BillingService(BillRepository bills, CustomerClient customers, ProductClient products) {
        this.bills = bills;
        this.customers = customers;
        this.products = products;
    }

    List<Bill> findAllForCustomer(Long customerId) {
        return bills.findAllByCustomerIdOrderByBillingDateDescIdDesc(customerId);
    }

    Bill findFullBill(Long id) {
        Bill bill = bills.findWithItemsById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Facture introuvable."));

        bill.setCustomer(fetch(() -> customers.findById(bill.getCustomerId()), "clients").orElse(null));
        Map<Long, Optional<Product>> productsById = new HashMap<>();
        for (ProductItem item : bill.getProductItems()) {
            item.setProduct(productsById.computeIfAbsent(item.getProductId(), this::findProduct).orElse(null));
        }
        return bill;
    }

    Bill create(CreateBillRequest request) {
        Customer customer = fetch(() -> customers.findById(request.customerId()), "clients").orElseThrow(() ->
                new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Le client n'existe pas."));

        Bill bill = new Bill(customer.id(), Instant.now());
        bill.setCustomer(customer);
        Map<Long, Optional<Product>> productsById = new HashMap<>();
        for (CreateBillRequest.Line line : request.items()) {
            Product product = productsById.computeIfAbsent(line.productId(), this::findProduct).orElseThrow(() ->
                    new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                            "Le produit " + line.productId() + " n'existe pas."));
            bill.addItem(product.id(), line.quantity(), product.price());
        }
        for (ProductItem item : bill.getProductItems()) {
            item.setProduct(productsById.get(item.getProductId()).orElseThrow());
        }
        return bills.save(bill);
    }

    private Optional<Product> findProduct(Long id) {
        return fetch(() -> products.findById(id), "produits");
    }

    private <T> Optional<T> fetch(Supplier<EntityModel<T>> request, String service) {
        try {
            return Optional.ofNullable(request.get().getContent());
        } catch (FeignException.NotFound ex) {
            return Optional.empty();
        } catch (FeignException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Le service " + service + " est temporairement indisponible.", ex);
        }
    }
}
