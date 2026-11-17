package ma.tp.microservices.billing;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import jakarta.persistence.Transient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(indexes = @Index(name = "idx_bill_customer", columnList = "customer_id"))
class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Instant billingDate;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL)
    @OrderBy("id ASC")
    private List<ProductItem> productItems = new ArrayList<>();

    @Transient
    private Customer customer;

    protected Bill() {
    }

    Bill(Long customerId, Instant billingDate) {
        this.customerId = customerId;
        this.billingDate = billingDate;
    }

    void addItem(Long productId, int quantity, BigDecimal unitPrice) {
        productItems.add(new ProductItem(this, productId, quantity, unitPrice));
    }

    void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Long getId() {
        return id;
    }

    public Instant getBillingDate() {
        return billingDate;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public List<ProductItem> getProductItems() {
        return productItems;
    }

    public Customer getCustomer() {
        return customer;
    }

    public BigDecimal getTotal() {
        return productItems.stream()
                .map(ProductItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
