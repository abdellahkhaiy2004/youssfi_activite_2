package ma.tp.microservices.billing;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RefreshScope
class BillingConfigurationController {
    private final String message;

    BillingConfigurationController(@Value("${billing.message}") String message) {
        this.message = message;
    }

    @GetMapping("/billing-config")
    public Map<String, String> config() {
        return Map.of("message", message);
    }
}
