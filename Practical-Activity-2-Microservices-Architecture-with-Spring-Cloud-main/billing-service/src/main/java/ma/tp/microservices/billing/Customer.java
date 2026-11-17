package ma.tp.microservices.billing;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
record Customer(Long id, String name, String email) {
}
