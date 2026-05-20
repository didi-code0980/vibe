# Examples — Backend Code Standards

Complete class examples applying all 13 rules, organized by file type.

---

## 1. Constants File

```java
package com.reuselib.common.constants;

public final class OrderConstants {
    private OrderConstants() {}

    public static final String STATUS_PENDING   = "PENDING";
    public static final String STATUS_CONFIRMED = "CONFIRMED";
    public static final String STATUS_CANCELLED = "CANCELLED";
    public static final String STATUS_COMPLETED = "COMPLETED";

    public static final String PAYMENT_STATUS_PAID   = "PAID";
    public static final String PAYMENT_STATUS_UNPAID = "UNPAID";

    public static final String ORDER_CODE_PREFIX = "ORD-";

    public static final String MSG_ORDER_NOT_FOUND       = "Order not found";
    public static final String MSG_ORDER_NOT_CANCELLABLE = "Order cannot be cancelled in its current status";
    public static final String MSG_ORDER_ALREADY_PAID    = "Order has already been paid";
}
```

---

## 2. Entity with Business Logic (R11)

```java
@Entity
@Table(name = "orders")
public class Order {

    // R2: static before instance
    private static final Logger log = LoggerFactory.getLogger(Order.class);

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;

    private String status;

    private String paymentStatus;

    private BigDecimal amount;

    private LocalDateTime createdAt;

    private LocalDateTime cancelledAt;

    // R11: business conditions as entity methods
    public boolean isCancellable() {
        return !OrderConstants.STATUS_COMPLETED.equals(this.status)
            && !OrderConstants.STATUS_CANCELLED.equals(this.status);
    }

    public boolean requiresRefund() {
        return OrderConstants.PAYMENT_STATUS_PAID.equals(this.paymentStatus)
            && this.amount != null
            && this.amount.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isPending() {
        return OrderConstants.STATUS_PENDING.equals(this.status);
    }

    public void cancel() {
        this.status = OrderConstants.STATUS_CANCELLED;
        this.cancelledAt = LocalDateTime.now();
    }

    public void confirm() {
        this.status = OrderConstants.STATUS_CONFIRMED;
    }
}
```

---

## 3. Service Class

```java
@Service
@Transactional
public class OrderService {

    // R2: static before instance
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    // R1: one blank line between fields
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RefundService refundService;

    @Autowired
    private NotificationService notificationService;

    // R6: meaningful name; R5: single responsibility
    public OrderResponse createOrder(CreateOrderRequest request) {
        this.validateCreateOrderRequest(request);
        Order order = this.buildOrderEntity(request);
        Order saved = this.orderRepository.save(order);
        this.notificationService.sendOrderConfirmation(saved);
        return this.mapToOrderResponse(saved);
    }

    public OrderResponse findOrderById(Long orderId) {
        return this.orderRepository.findById(orderId)
            .map(this::mapToOrderResponse)
            .orElseThrow(() -> new NotFoundException(OrderConstants.MSG_ORDER_NOT_FOUND));
    }

    // R11: no if-else chain — delegates to Entity methods
    public void cancelOrder(Long orderId) {
        Order order = this.findOrderEntityById(orderId);
        if (!order.isCancellable()) {
            throw new BusinessException(OrderConstants.MSG_ORDER_NOT_CANCELLABLE);
        }
        if (order.requiresRefund()) {
            this.refundService.initiateRefund(order);
        }
        order.cancel();
        this.orderRepository.save(order);
        this.notificationService.sendCancellationNotice(order);
    }

    private void validateCreateOrderRequest(CreateOrderRequest request) {
        if (request.getUserId() == null) {
            throw new BadRequestException("userId is required");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order must contain at least one item");
        }
    }

    private Order buildOrderEntity(CreateOrderRequest request) {
        Order order = new Order();
        order.setCode(this.generateOrderCode());
        order.setUserId(request.getUserId());
        order.setStatus(OrderConstants.STATUS_PENDING);
        order.setCreatedAt(LocalDateTime.now());
        return order;
    }

    private String generateOrderCode() {
        return OrderConstants.ORDER_CODE_PREFIX
            + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private Order findOrderEntityById(Long orderId) {
        return this.orderRepository.findById(orderId)
            .orElseThrow(() -> new NotFoundException(OrderConstants.MSG_ORDER_NOT_FOUND));
    }

    private OrderResponse mapToOrderResponse(Order order) {
        // mapping logic
        return new OrderResponse();
    }
}
```

---

## 4. Controller Class (R9, R10)

```java
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // R9: snake_case endpoint
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @RequestBody @Valid CreateOrderRequest request) {
        OrderResponse data = this.orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(data));
    }

    @GetMapping("/{order_id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @PathVariable Long order_id) {
        OrderResponse data = this.orderService.findOrderById(order_id);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // R10: multi-param search uses request body
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> searchOrders(
            @RequestBody SearchOrderRequest request) {
        List<OrderResponse> data = this.orderService.searchOrders(request);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // R10: bulk delete with list → request body
    @DeleteMapping("/bulk")
    public ResponseEntity<ApiResponse<Void>> deleteOrders(
            @RequestBody DeleteOrdersRequest request) {
        this.orderService.deleteOrders(request.getOrderIds());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PatchMapping("/{order_id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @PathVariable Long order_id) {
        this.orderService.cancelOrder(order_id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
```

---

## 5. FeignClient (R12)

```java
@FeignClient(name = "inventory-service", url = "${service.inventory.url}")
public interface InventoryClient {

    @GetMapping("/api/v1/inventory/{product_id}")
    ApiResponse<InventoryResponse> getInventoryByProductId(
            @PathVariable("product_id") Long productId);

    @PostMapping("/api/v1/inventory/reserve")
    ApiResponse<Void> reserveStock(@RequestBody ReserveStockRequest request);

    @PostMapping("/api/v1/inventory/search")
    ApiResponse<List<InventoryResponse>> searchInventory(
            @RequestBody SearchInventoryRequest request);
}
```

---

## 6. Repository with @Query formatting (R13)

```java
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // R13: multi-line text block for each operator
    @Query("""
            SELECT CASE WHEN COUNT(o) > 0 THEN TRUE ELSE FALSE END
            FROM Order o
            WHERE o.userId = :userId
                AND o.status = :status
            """)
    Boolean existsByUserIdAndStatus(
            @Param("userId") Long userId,
            @Param("status") String status);

    @Query("""
            SELECT o
            FROM Order o
            WHERE o.userId = :userId
                AND (:status IS NULL OR o.status = :status)
                AND o.createdAt >= :fromDate
                AND o.createdAt <= :toDate
            ORDER BY o.createdAt DESC
            """)
    List<Order> findByUserIdAndStatusAndDateRange(
            @Param("userId") Long userId,
            @Param("status") String status,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query("""
            SELECT o
            FROM Order o
            WHERE o.status = :status
                AND o.createdAt < :expiryDate
            ORDER BY o.createdAt ASC
            """)
    List<Order> findExpiredPendingOrders(
            @Param("status") String status,
            @Param("expiryDate") LocalDateTime expiryDate);
}
```

---

## 7. Environment Config (R8)

```java
@Service
public class KafkaConsumerService {

    // R8: all infra config from environment
    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapAddress;

    @Value("${spring.kafka.consumer.group-id}")
    private String groupId;

    @KafkaListener(topics = "${spring.kafka.topic.edit_properties}", groupId = "crm-service")
    public void listenEditProperties(String message) {
        // handle message
    }

    @KafkaListener(topics = "${spring.kafka.topic.order_created}", groupId = "crm-service")
    public void listenOrderCreated(String message) {
        // handle message
    }
}
```

```yaml
# application.yml — values defined per environment
spring:
  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
    topic:
      edit_properties: crm.edit_properties
      order_created: crm.order_created
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/crmdb}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:secret}
```

---

## 8. Common Violation Patterns

### R3 — Missing `this.`
```java
// ❌
public void activateUser(Long userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new NotFoundException("User not found"));
    sendActivationEmail(user);
}

// ✅
public void activateUser(Long userId) {
    User user = this.userRepository.findById(userId)
        .orElseThrow(() -> new NotFoundException(UserConstants.MSG_USER_NOT_FOUND));
    this.sendActivationEmail(user);
}
```

### R4 — Hardcoded String
```java
// ❌
if ("ACTIVE".equals(user.getStatus())) {
    cache.put("user:token:" + userId, token);
}

// ✅
if (UserConstants.STATUS_ACTIVE.equals(user.getStatus())) {
    cache.put(CacheConstants.USER_TOKEN_PREFIX + userId, token);
}
```

### R2 — Wrong field order
```java
// ❌
public class PaymentService {
    private String currency;
    private static final String DEFAULT_CURRENCY = "VND";  // static after instance
}

// ✅
public class PaymentService {
    private static final String DEFAULT_CURRENCY = "VND";  // static first
    private String currency;
}
```
