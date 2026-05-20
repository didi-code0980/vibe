---
name: backend-code-standards
description: >
  Apply coding standards for Java/Spring Boot backend. MUST use this skill when:
  (1) generating new Java/Spring Boot code (class, service, controller, repository, entity, etc.),
  (2) reviewing or refactoring existing Java code,
  (3) asked about how to write, name, or organize Java code in the project.
  Trigger even when the user just says "write a service", "create a controller", "check this code",
  or "refactor this" without explicitly mentioning standards.
---

# Backend Code Standards — Java / Spring Boot

These rules are mandatory for **every** Java file in the backend project.
When generating new code → comply from the start.
When reviewing code → check each rule and list all violations clearly.

---

## RULE 1 — Field declarations: exactly one blank line apart

Each field (or annotated field group) must be separated by **exactly one blank line**.
No cramming together, no more than one blank line between them.

```java
// ✅ CORRECT
@Autowired
private UserRepository userRepository;

@Autowired
private EmailService emailService;

private String currentStatus;

// ❌ WRONG — no blank line between fields
@Autowired
private UserRepository userRepository;
@Autowired
private EmailService emailService;

// ❌ WRONG — more than one blank line
@Autowired
private UserRepository userRepository;


private String currentStatus;
```

---

## RULE 2 — Field declaration order within a class

Mandatory top-to-bottom order:

```
1. static final constants   (public → protected → private)
2. static variables         (public → protected → private)
3. instance variables       (public → protected → private)
4. constructors
5. methods
```

```java
// ✅ CORRECT
public class OrderService {

    private static final String ORDER_PREFIX = "ORD";

    private static int instanceCount = 0;

    @Autowired
    private OrderRepository orderRepository;

    private String currentUser;

    // constructors...
    // methods...
}
```

---

## RULE 3 — Use `this.` when accessing fields or methods in the same class

Inside every method body, always prefix with `this.` when accessing an instance field
or calling another method defined in the same class.

```java
// ✅ CORRECT
public void processOrder(Order order) {
    this.validateOrder(order);
    String status = this.buildStatus(order);
    this.orderRepository.save(order);
}

// ❌ WRONG
public void processOrder(Order order) {
    validateOrder(order);
    String status = buildStatus(order);
    orderRepository.save(order);
}
```

**Acceptable exception:** local variables within the same scope do not need `this.`.

---

## RULE 4 — String literals must be declared in a Constants file

Every hardcoded String used in business logic **must** be moved to a Constants file.

```java
// ❌ WRONG — hardcoded String
if (user.getRole().equals("ADMIN")) { ... }
response.setMessage("User not found");
String key = "user:session:" + userId;

// ✅ CORRECT — use constants
if (user.getRole().equals(UserConstants.ROLE_ADMIN)) { ... }
response.setMessage(MessageConstants.USER_NOT_FOUND);
String key = CacheConstants.USER_SESSION_PREFIX + userId;
```

**Naming conventions for Constants files:**
- Group by domain: `UserConstants`, `OrderConstants`, `MessageConstants`, `CacheConstants`
- Place in `constants/` or `common/constants/` package
- Always use `public static final`

```java
public final class UserConstants {
    private UserConstants() {} // prevent instantiation

    public static final String ROLE_ADMIN    = "ADMIN";
    public static final String ROLE_USER     = "USER";
    public static final String STATUS_ACTIVE = "ACTIVE";
}
```

**Acceptable exceptions:** Strings inside annotations (`@RequestMapping("/api/v1/...")`) and test data.

---

## RULE 5 — Each method has a single responsibility (SRP)

- A method does **one thing only**, clearly
- If a method can be broken into independent steps → split it
- Target max ~30 lines/method (excluding comments and blank lines); if longer → consider splitting

```java
// ❌ WRONG — one method doing too much
public void createUser(UserDto dto) {
    if (dto.getEmail() == null) throw new BadRequestException("...");
    if (dto.getPhone().length() != 10) throw new BadRequestException("...");
    User user = new User();
    user.setEmail(dto.getEmail());
    user.setCreatedAt(LocalDateTime.now());
    userRepository.save(user);
    emailService.send(dto.getEmail(), "Welcome...");
}

// ✅ CORRECT — responsibilities separated
public void createUser(UserDto dto) {
    this.validateUserDto(dto);
    User user = this.buildUserEntity(dto);
    this.userRepository.save(user);
    this.sendWelcomeEmail(user);
}

private void validateUserDto(UserDto dto) { ... }
private User buildUserEntity(UserDto dto) { ... }
private void sendWelcomeEmail(User user) { ... }
```

---

## RULE 6 — Method names must be meaningful

Method names must **precisely** describe the action performed — no vague names.

| ❌ Bad name | ✅ Good name |
|---|---|
| `process()` | `processPaymentRefund()` |
| `handle()` | `handleOrderCancellation()` |
| `check()` | `validateUserPermission()` |
| `get()` | `findActiveOrdersByUserId()` |
| `doStuff()` | `syncInventoryFromWarehouse()` |
| `update2()` | `updateOrderShippingAddress()` |

**Prefix conventions by action type:**
- `find...` / `get...` — query, return data
- `create...` / `build...` — create new object/entity
- `update...` / `modify...` — update existing data
- `delete...` / `remove...` — delete/remove
- `validate...` — check and throw exception if invalid
- `is...` / `has...` / `can...` — return boolean
- `send...` / `publish...` — send message/event/notification
- `sync...` / `import...` / `export...` — data synchronization

---

## RULE 7 — File length must not exceed 1500 lines

If a file is approaching 1500 lines → **must** propose splitting it.

Common splitting strategies:
- **Oversized Service** → split by feature group: `OrderQueryService` + `OrderCommandService`
- **Oversized Controller** → split by resource: `OrderController` + `OrderReportController`
- **Entity/DTO with too many fields** → consider Embedded objects
- **Many utility methods** → extract to `XxxHelper` or `XxxUtils`

When generating code, if the file is estimated to exceed 1500 lines → **propose a split architecture upfront**.

---

## RULE 8 — Environment variables for sensitive or changeable config

Any value related to **database credentials, infrastructure addresses, secrets, or config
that may change across environments** must use `@Value` referencing `application.properties` / `application.yml`.
Never hardcode these values directly in code.

```java
// ✅ CORRECT
@Value("${spring.kafka.bootstrap-servers}")
private String bootstrapAddress;

@Value("${spring.datasource.url}")
private String datasourceUrl;

@KafkaListener(topics = "${spring.kafka.topic.edit_properties}", groupId = "crm-service")
public void listenEditProperties(String message) { ... }

// ❌ WRONG — hardcoded infrastructure config
private String bootstrapAddress = "localhost:9092";
private String datasourceUrl = "jdbc:postgresql://prod-db:5432/mydb";
```

**Values that must always be externalized:**
- Database URLs and credentials
- Kafka bootstrap servers and topic names
- Redis host/port
- External service base URLs
- Secret keys, tokens, API keys
- Any value that differs between dev / staging / production

---

## RULE 9 — API endpoints follow kebab-case; response format must be consistent

**Endpoint naming:** always use `kebab-case` for URL path segments.

```
✅ /api/v1/user-orders
✅ /api/v1/order-items/{item-id}
✅ /api/v1/payment-methods

❌ /api/v1/userOrders      (camelCase)
❌ /api/v1/order_items     (snake_case)
```

**Response format:** every API must return the same wrapper structure used across the project.
Do not invent a different response shape for a new endpoint. Reuse the existing `ApiResponse<T>` (or equivalent) class.

```java
// ✅ CORRECT — consistent wrapper
@GetMapping("/orders/{order-id}")
public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable("order-id") Long orderId) {
    OrderResponse data = this.orderService.findOrderById(orderId);
    return ResponseEntity.ok(ApiResponse.success(data));
}

// ❌ WRONG — custom ad-hoc response shape
@GetMapping("/orders/{orderId}")
public Map<String, Object> getOrder(@PathVariable Long orderId) {
    return Map.of("order", orderService.findOrderById(orderId), "ok", true);
}
```

---

## RULE 10 — Use request body for multi-param or list-param APIs

If an API receives **3 or more parameters**, or any parameter is a **list/array**,
move them into a `@RequestBody` instead of query params or path variables.

```java
// ❌ WRONG — too many query params
@GetMapping("/orders/search")
public ResponseEntity<ApiResponse<List<OrderResponse>>> searchOrders(
        @RequestParam String status,
        @RequestParam String userId,
        @RequestParam String fromDate,
        @RequestParam String toDate) { ... }

// ✅ CORRECT — use request body
@PostMapping("/orders/search")
public ResponseEntity<ApiResponse<List<OrderResponse>>> searchOrders(
        @RequestBody SearchOrderRequest request) { ... }

// ❌ WRONG — list as repeated query params
@DeleteMapping("/orders")
public ResponseEntity<Void> deleteOrders(@RequestParam List<Long> orderIds) { ... }

// ✅ CORRECT — list in request body
@DeleteMapping("/orders")
public ResponseEntity<Void> deleteOrders(@RequestBody DeleteOrdersRequest request) { ... }
```

---

## RULE 11 — Move business logic into Entity/Model to reduce if-else in Service/Controller

Instead of stacking `if-else` chains in Service or Controller, encapsulate state-based
or condition-based logic as methods on the Entity or Model itself.
This keeps Service methods readable and Entity behavior testable in isolation.

```java
// ❌ WRONG — business logic sprawled across Service
public void cancelOrder(Long orderId) {
    Order order = this.findOrderEntityById(orderId);
    if (order.getStatus().equals("COMPLETED") || order.getStatus().equals("CANCELLED")) {
        throw new BusinessException("Order cannot be cancelled");
    }
    if (order.getPaymentStatus().equals("PAID") && order.getAmount() > 0) {
        // trigger refund...
    }
    order.setStatus("CANCELLED");
}

// ✅ CORRECT — logic encapsulated in Entity
public class Order {

    public boolean isCancellable() {
        return !OrderConstants.STATUS_COMPLETED.equals(this.status)
            && !OrderConstants.STATUS_CANCELLED.equals(this.status);
    }

    public boolean requiresRefund() {
        return OrderConstants.PAYMENT_STATUS_PAID.equals(this.paymentStatus)
            && this.amount > 0;
    }

    public void cancel() {
        this.status = OrderConstants.STATUS_CANCELLED;
        this.cancelledAt = LocalDateTime.now();
    }
}

// Service becomes clean and readable
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
}
```

---

## RULE 12 — Prefer FeignClient over manually written REST clients

When calling external services or other internal microservices, always use **FeignClient**.
Do not manually instantiate `RestTemplate` or `HttpClient` unless FeignClient is technically not viable.

```java
// ✅ CORRECT — declarative FeignClient
@FeignClient(name = "inventory-service", url = "${service.inventory.url}")
public interface InventoryClient {

    @GetMapping("/api/v1/inventory/{product_id}")
    ApiResponse<InventoryResponse> getInventoryByProductId(@PathVariable("product_id") Long productId);

    @PostMapping("/api/v1/inventory/reserve")
    ApiResponse<Void> reserveStock(@RequestBody ReserveStockRequest request);
}

// ❌ WRONG — manually written REST call
public InventoryResponse getInventory(Long productId) {
    RestTemplate restTemplate = new RestTemplate();
    String url = "http://inventory-service/api/v1/inventory/" + productId;
    return restTemplate.getForObject(url, InventoryResponse.class);
}
```

**Why FeignClient:** declarative, auto-integrates with load balancer, easy to mock in tests,
consistent error handling, no boilerplate HTTP setup.

---

## RULE 13 — Repository @Query must use clear multi-line formatting

Every `@Query` with more than one clause must format each SQL operator on its own line.
Use text blocks (`"""`) for all non-trivial queries.

```java
// ✅ CORRECT
@Query("""
        SELECT CASE WHEN COUNT(l) > 0 THEN TRUE ELSE FALSE END
        FROM Lead l
        WHERE (:contactCellPhone IS NOT NULL AND :contactCellPhone <> ''
            AND l.contactCellPhone = :contactCellPhone)
        """)
Boolean existsByContactCellPhone(@Param("contactCellPhone") String contactCellPhone);

@Query("""
        SELECT o
        FROM Order o
        WHERE o.userId = :userId
            AND o.status = :status
            AND o.createdAt >= :fromDate
            AND o.createdAt <= :toDate
        ORDER BY o.createdAt DESC
        """)
List<Order> findByUserIdAndStatusAndDateRange(
        @Param("userId") Long userId,
        @Param("status") String status,
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate);

// ❌ WRONG — everything on one line
@Query("SELECT o FROM Order o WHERE o.userId = :userId AND o.status = :status AND o.createdAt >= :fromDate ORDER BY o.createdAt DESC")
List<Order> findOrders(@Param("userId") Long userId, @Param("status") String status, @Param("fromDate") LocalDateTime fromDate);
```

**Formatting rules:**
- `SELECT`, `FROM`, `WHERE`, `AND`, `OR`, `ORDER BY`, `GROUP BY`, `JOIN` each start on their own line
- Sub-conditions inside `WHERE` indented one extra level
- Closing `"""` on its own line

---

## Review Checklist

When reviewing code, check in order:

- [ ] R1: Exactly one blank line between field declarations?
- [ ] R2: Static fields declared before instance fields?
- [ ] R3: `this.` used for all fields/methods of the same class?
- [ ] R4: No hardcoded String literals in business logic?
- [ ] R5: Each method has a single responsibility?
- [ ] R6: Method names are meaningful and use correct prefix?
- [ ] R7: File is under 1500 lines?
- [ ] R8: Sensitive/changeable config uses `@Value` from environment?
- [ ] R9: Endpoints use snake_case? Response format matches project convention?
- [ ] R10: Multi-param or list-param APIs use request body?
- [ ] R11: Business conditions moved into Entity methods, not if-else in Service?
- [ ] R12: REST client calls use FeignClient?
- [ ] R13: `@Query` uses multi-line text block formatting?

Report violations in this format:
```
[R{number}] {Rule name} — Line {N}: {specific description of violation}
Suggested fix: ...
```

---

## See Also

See `references/examples.md` for complete class examples: Service, Controller, Repository, Entity, Constants, FeignClient.
