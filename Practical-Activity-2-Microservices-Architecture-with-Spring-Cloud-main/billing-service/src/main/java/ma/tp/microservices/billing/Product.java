package ma.tp.microservices.billing;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
record Product(Long id, String name, BigDecimal price, Integer quantity) {
}
