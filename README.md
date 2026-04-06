# OnesToManys (Dealership Database)

This project is a 3-tier dealership database application.
It uses a REST API and a relational database to manage dealerships and cars.

## Quick Start

If you are new to this project, read these first in order:

1. [guides/PROJECT_GUIDE.md](guides/PROJECT_GUIDE.md): full project overview, architecture, API reference, and completion tracking.
2. [guides/RUN_PHASE1.md](guides/RUN_PHASE1.md): exact commands to run and validate the app.
3. [guides/STUDY_GUIDE_API_SETUP.md](guides/STUDY_GUIDE_API_SETUP.md): setup patterns for dealership database projects.

Run the regression safety checks with:

python -m unittest discover -s tests -v

## Living Project Guide

Project guides are organized under the `guides/` folder.

Use [guides/PROJECT_GUIDE.md](guides/PROJECT_GUIDE.md) as the continuously updated source for:

- a basic walkthrough
- a technical architecture breakdown for experienced developers
- decisions, changelog, and next planned changes

Use [guides/STUDY_GUIDE_API_SETUP.md](guides/STUDY_GUIDE_API_SETUP.md) for a thorough reference on setting up similar dealership database API scripts.

## Guide Index

- [guides/PROJECT_GUIDE.md](guides/PROJECT_GUIDE.md): Living project plan, technical architecture, API reference, and verification log.
- [guides/STUDY_GUIDE_API_SETUP.md](guides/STUDY_GUIDE_API_SETUP.md): Thorough study guide for building similar dealership database apps.
- [guides/RUN_PHASE1.md](guides/RUN_PHASE1.md): Run instructions for setup and validation.
- [guides/RELATIONSHIPS_CHECKLIST.md](guides/RELATIONSHIPS_CHECKLIST.md): Tailored next steps and requirements for the dealership/cars relationship work.
- [guides/endpoint_map.md](guides/endpoint_map.md): Endpoint inventory and quick curl examples.
- [guides/ArchitectureNotes.md](guides/ArchitectureNotes.md): Master-detail design notes.
- [guides/Diagrams.md](guides/Diagrams.md): Visual/diagram notes.
- [guides/misc](guides/misc): Archived or non-essential project artifacts (old backups, temp DB files, Finder metadata).

## Architecture Implementation

- [app.py](app.py): Current API entrypoint for the integrated implementation.

## Foundation

- build a plan for the project
- design the database schema by building out data objects
- write a SQL file with the schema
- generate another SQL file filled with synthetic generated data that can be loaded into the database
- create a REST server to create, read, update, and delete data objects
  - start with `curl` and doing a GET of your _master_ table
  - continue with `curl` and doing a GET of your _detail_ table
  - add the other CRUD operations for both master and detail tables

### Relationships

- add a one to many relationship between your master and detail tables
- add REST API endpoints for the one to many relationship
- use a GUI based REST API client to test your endpoints
  - you might use Postman or Insomnia, or even Everest.
- add a means to dump and load your data to either SQL and/or JSON files

### User Interface

- create a polished one-page interface to interact with your REST API
- add clean buttons for GET requests and CRUD forms for dealerships and cars
- show relationship data and support JSON upload/export for dealership data

### Overall Stack Notes

A basic SQL lab: tables, schema, selects, and CRUD in SQL REPL; simple API access.

## Understanding Master-Detail Relationships in Data Modeling

## What is a Master-Detail Relationship?

A master-detail relationship (sometimes called parent-child relationship) is a fundamental data modeling concept where:

- **Master (Parent) Entity**: Contains primary information and can exist independently
- **Detail (Child) Entity**: Contains secondary information that depends on the master entity and cannot exist without it

## Why Master-Detail Relationships Matter

Understanding master-detail relationships is crucial for several reasons:

1. **Data Integrity**: Ensures related data remains consistent and valid
2. **Efficient Data Organization**: Provides logical structure to complex information
3. **Improved User Experience**: Enables intuitive navigation through hierarchical data
4. **Optimized Queries**: Allows for more efficient database operations
5. **Scalable Application Design**: Creates maintainable, extensible software architecture

## Real-World Examples Across Domains

### E-Commerce

- **Master**: Dealership
- **Detail**: Car

One dealership can contain many cars, but each car belongs to exactly one dealership.

### Finance

- **Master**: Invoice
- **Detail**: Line Items

An invoice contains multiple line items, but each line item is associated with exactly one invoice.

### Healthcare

- **Master**: Patient
- **Detail**: Medical Records

A patient has multiple medical records, but each record belongs to one patient.

### Education

- **Master**: Course
- **Detail**: Lectures/Assignments

A course consists of multiple lectures and assignments, but each lecture/assignment belongs to one course.

## Database Implementation

In relational databases, master-detail relationships are typically implemented using foreign keys:

```/dev/null/example-schema.sql#L1-10
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE
);

CREATE TABLE order_items (
    item_id INT PRIMARY KEY,
    order_id INT REFERENCES orders(order_id),
    product_id INT,
    quantity INT
);
```

## Implementing in Java and Python

### Java Example (Spring Boot) - REST API

```/dev/null/Order.java#L1-15
@Entity
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Date orderDate;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items = new ArrayList<>();

    // Getters and setters
}
```

```/dev/null/OrderItem.java#L1-15
@Entity
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    private String productName;
    private int quantity;

    // Getters and setters
}
```

### Python Example (SQLAlchemy)

```/dev/null/models.py#L1-20
from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Order(Base):
    __tablename__ = 'orders'
    id = Column(Integer, primary_key=True)
    order_date = Column(Date)
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = 'order_items'
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey('orders.id'))
    product_name = Column(String)
    quantity = Column(Integer)
    order = relationship("Order", back_populates="items")
```

## REST API Design for Master-Detail

A well-designed REST API should reflect the master-detail relationship in its endpoints:

### Resource Structure

- `/orders` - Get all orders
- `/orders/{id}` - Get a specific order
- `/orders/{id}/items` - Get all items for a specific order
- `/orders/{id}/items/{itemId}` - Get a specific item from a specific order

### Java Example (Spring Boot)

```/dev/null/OrderController.java#L1-22
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.findAll();
    }

    @GetMapping("/{id}")
    public Order getOrderById(@PathVariable Long id) {
        return orderService.findById(id);
    }

    @GetMapping("/{id}/items")
    public List<OrderItem> getOrderItems(@PathVariable Long id) {
        Order order = orderService.findById(id);
        return order.getItems();
    }
}
```

### Python Example (Flask)

```/dev/null/app.py#L1-25
from flask import Flask, jsonify
from models import Order, OrderItem
from database import db_session

app = Flask(__name__)

@app.route('/api/orders', methods=['GET'])
def get_all_orders():
    orders = Order.query.all()
    return jsonify([{'id': o.id, 'order_date': o.order_date} for o in orders])

@app.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    order = Order.query.get_or_404(order_id)
    return jsonify({
        'id': order.id,
        'order_date': order.order_date,
        'items': [{'id': item.id, 'product_name': item.product_name} for item in order.items]
    })

@app.route('/api/orders/<int:order_id>/items', methods=['GET'])
def get_order_items(order_id):
    order = Order.query.get_or_404(order_id)
    return jsonify([{'id': item.id, 'product_name': item.product_name} for item in order.items])
```

## Administration Best Practices

1. **Cascade Operations**: Properly configure delete/update cascades
2. **Indexes**: Create appropriate indexes on foreign keys
3. **Constraints**: Implement referential integrity constraints
4. **Transactions**: Use transactions for operations involving both master and detail records
5. **Pagination**: Implement pagination for large detail collections
6. **Caching**: Consider caching frequently accessed master records

## Conclusion

Master-detail relationships are the backbone of effective data modeling and application development. Understanding these relationships enables beginners to:

1. Design intuitive and efficient data models
2. Create scalable database schemas
3. Develop user-friendly applications
4. Build RESTful APIs that accurately represent business domains

As you progress in your Java or Python development journey, mastering this concept will significantly enhance your ability to model real-world problems and create robust solutions. Whether you're building a simple to-do app or an enterprise-grade system, the master-detail pattern will be a constant companion in your development toolkit.

## But wait...DTO?

What's a DTO? Why? <https://zcw.guru/kristofer/dtointro>

## Possible project relations

These are some possible projrct relations for your ListDetail app.
You can also propose your own project relations, but it must be approved by an
instructor.

- Dealership (master) - Cars (detail)
- Dealership (master) - Service Records (detail)
- Dealership (master) - Sales Leads (detail)
