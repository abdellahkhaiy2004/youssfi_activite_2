package ma.tp.microservices.billing;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

record CreateBillRequest(
        @NotNull @Positive Long customerId,
        @NotEmpty List<@NotNull @Valid Line> items
) {
    record Line(@NotNull @Positive Long productId, @NotNull @Positive Integer quantity) {
    }
}
