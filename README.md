# Zwane Tuckshop MVP

## Project Overview

Zwane Tuckshop MVP is a minimum viable product developed for Sprint 1 using the Scrum methodology. The system is designed for Zwane Tuckshop, located opposite the DUT Indumiso Campus main gate, and provides a simple browser-based solution for day-to-day tuckshop operations.

The purpose of the application is to improve sales processing, stock tracking, product management, and reporting without requiring a backend server. The solution is fully self-contained and stores data in the browser using localStorage.

## Business Context

The owner of Zwane Tuckshop requires an IT solution that can:

- record sales quickly to reduce queues
- track stock levels and identify low-stock items
- provide daily sales reports
- allow products to be added and removed easily

## Objectives of the MVP

This Sprint 1 MVP aims to deliver the core functions needed for tuckshop operations:

- fast sales capture at the point of sale
- live stock visibility
- daily reporting of sales activity
- basic product administration

## Technology Used

- HTML
- CSS
- Vanilla JavaScript
- browser localStorage

No frameworks or external libraries are used.

## System Modules

### 1. Point of Sale Module

File: `index.html`

This module allows the cashier to record a sale quickly.

Features:

- dropdown list of products with price and stock information
- quantity input field with validation
- add to cart functionality
- remove item from cart
- clear cart functionality
- running total of the sale
- complete sale button to finalize a transaction
- automatic deduction of stock after sale completion
- sale saved with timestamp and date

### 2. Stock Management Module

File: `stock.html`

This module provides a view of current stock levels.

Features:

- stock table with product name, price, stock, and alert status
- alert shows `⚠️ Low stock` when stock is below 10
- search by product name
- low-stock-only filter
- automatic update after sales are completed

### 3. Reporting Module

File: `reports.html`

This module displays the current day’s sales.

Features:

- current date display
- list of all sales made today
- total sales amount for the day
- clear today’s report with confirmation prompt

### 4. Product Management Module

File: `products.html`

This module manages product records used across the app.

Features:

- add a new product using name, price, and initial stock
- view all products in a table
- search products by name
- delete existing products
- updates reflected across POS, stock, and reporting views

## Default Seed Data

The application loads the following products on first use:

- Simba Chips, R8.00, stock 50
- Coca-Cola 500ml, R12.00, stock 30
- Rose Milk, R7.00, stock 20
- Bread Roll, R5.00, stock 40

## Data Persistence

The system uses browser localStorage with the following keys:

- `products`
- `sales`

Each sale record stores:

- `date` in `YYYY-MM-DD` format
- `timestamp`
- `items` array
- `total`

## Project File Structure

- `index.html` for the POS module
- `stock.html` for stock management
- `reports.html` for reporting
- `products.html` for product management
- `style.css` for shared styling
- `script.js` for shared application logic

## How To Run the Application

### Option 1: Open in a Browser

Open `index.html` directly in a modern browser.

### Option 2: Run a Local Server

If Python is installed, run:

```powershell
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/index.html
```

## Current Implementation Improvements

The current version includes the following improvements beyond the minimum scaffold:

- shared dashboard summary cards across all pages
- safer localStorage recovery if saved data is invalid
- stock-aware POS controls and disabled invalid actions
- product and stock search functionality
- low-stock filtering in the stock module
- responsive layout for desktop and mobile use

## Why Scrum Is Suitable for Zwane Tuckshop

Scrum is suitable for this project because the tuckshop owner’s requirements may change after interacting with the first working version of the system. Once the owner and cashier begin using the MVP, they may identify additional needs such as editing products, restocking stock, or exporting reports.

Scrum is appropriate because it supports:

- incremental delivery of working software
- regular stakeholder feedback
- flexibility when requirements change
- quick release of useful features

This makes Scrum a practical approach for a small business system where user feedback can improve the product after every sprint.

## Scrum Stages Used in the Project

### Product Backlog

All required system features are listed and prioritized. Examples include the POS module, stock tracking, daily reporting, and product management.

### Sprint Planning

The team selects backlog items for a sprint. In this case, a 2-week sprint can be used to deliver the Sprint 1 MVP.

### Daily Stand-ups

Short daily meetings are held to discuss completed work, planned work, and blockers.

### Sprint Review

At the end of the sprint, the working system is demonstrated to the owner or stakeholders for feedback.

### Sprint Retrospective

The team reflects on what went well, what could improve, and what actions should be taken in the next sprint.

## Business Units Affected

### Cashier

The cashier uses the POS to process customer purchases more efficiently.

### Owner

The owner benefits from stock visibility, product control, and daily sales insight.

### Stock Manager

The stock manager can identify low-stock products and keep the product list updated.

### Students

Students benefit from faster service and reduced waiting time in queues.

## Business Impact

The expected impact of the system includes:

- faster service and reduced congestion at the point of sale
- real-time stock awareness
- improved daily sales monitoring
- better decision-making based on current data

## Mitigation of Possible Negative Effects

Potential challenges and mitigation steps include:

- staff training requirements: provide a short orientation and basic usage guide
- technical interruptions during sales: keep a manual fallback process available
- accidental loss of browser data: review totals regularly and maintain simple manual backup notes when necessary

## Possible Future Enhancements

- edit and restock existing products
- export or print daily reports
- generate reports by date range
- introduce user roles or cashier login
- add backup and restore functionality

## Repository Link

GitHub repository:

- https://github.com/Nsikelelo88/Zwane-Tuckshop-mvp