package ma.tp.microservices.billing;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.net.URI;
import java.time.Instant;
import java.util.List;

@RestController
class BillRestController {
    private final BillingService billing;

    BillRestController(BillingService billing) {
        this.billing = billing;
    }

    @GetMapping("/bills")
    public List<BillSummary> bills(@RequestParam("customerId") Long customerId) {
        return billing.findAllForCustomer(customerId).stream().map(BillSummary::from).toList();
    }

    @GetMapping("/fullBill/{id}")
    public Bill fullBill(@PathVariable("id") Long id) {
        return billing.findFullBill(id);
    }

    @PostMapping("/bills")
    public ResponseEntity<Bill> create(@RequestBody @Valid CreateBillRequest request) {
        Bill bill = billing.create(request);
        return ResponseEntity.created(URI.create("fullBill/" + bill.getId())).body(bill);
    }

    record BillSummary(Long id, Instant billingDate, Long customerId, int lineCount, BigDecimal total) {
        static BillSummary from(Bill bill) {
            return new BillSummary(bill.getId(), bill.getBillingDate(), bill.getCustomerId(),
                    bill.getProductItems().size(), bill.getTotal());
        }
    }
}
