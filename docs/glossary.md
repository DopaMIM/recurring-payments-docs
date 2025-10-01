---
id: glossary
title: Glossary & Reference
sidebar_label: Glossary
sidebar_position: 6
---

This page provides a quick reference for fields, parameters, and terms used throughout the Blockhead Recurring Payments Protocol.

---

## Core Entities

### `sender`
The wallet address of the customer paying for the subscription.

### `recipient`
The wallet address of the merchant or service provider receiving payments.

### `paymentInterface`
The wallet address of the **payment gateway UI**. This address receives a share of the protocol fee for integrating recurring payments.

### `owner`
The contract deployer. Holds administrative privileges (not relevant to developers).

---

## Subscription Details

### `accountNumber`
A unique ID assigned to each subscription at creation. Used to query all related data.

### `amount`
The recurring charge amount, denominated in the token’s **smallest unit**.  
- Example: `1000000` with a 6-decimal token (USDC) = `1 USDC`.

### `token`
The ERC-20 token address used for the subscription (e.g., USDC, DAI).

### `timeIntervalSeconds`
How often payments occur, expressed in seconds.  
- 1 week = `604800`  
- 1 month (30 days) = `2592000`  
- 1 year (365 days) = `31536000`

### `paymentDue`
The Unix timestamp (in seconds) for the **next scheduled payment**.

### `canceled`
Boolean flag showing whether the subscription has been canceled.

---

## Metadata

### `additionalInformation`
A developer-defined string array for storing lightweight metadata.  
- Examples: customer IDs, product SKUs, subscription reference codes.  
- Keep values short — large arrays increase gas costs.

---

## Functions (Quick Reference)

- **`createRecurringPayment`** — Start a new subscription.  
- **`recurringPayments`** — Fetch full subscription details by ID.  
- **`getAccountNumbersByAddress`** — Find all subscriptions tied to an address.  
- **`getPaymentDue`** — Return the next due date.  
- **`isSubscriptionValid`** — Check if active (includes grace period).  
- **`cancelRecurringPayment`** — Cancel a subscription.  
- **`isPaymentCanceled`** — Confirm if canceled.  
- **`getCancelledAccounts`** — Return all canceled subscriptions.  
- **`getAdditionalInformation`** — Retrieve metadata array.

---

## Events (Quick Reference)

- **`RecurringPaymentCreated`** — Fires when a subscription is created.  
- **`RecurringPaymentCancelled`** — Fires when a subscription is canceled.  
- **`PaymentTransferred`** — Fires when a payment executes.

---

## Key Concepts

- **Grace Period:** Subscriptions remain valid for 24 extra hours past due date to handle blockchain delays.  
- **Approvals:** Customers should approve a **large or infinite allowance** once; recurring charges pull directly from it.  
- **Fee Split:** Each payment has a service fee split between the UI (`paymentInterface`) and the protocol owner.  
- **No Testnets:** The protocol is mainnet-only. See [Networks](./networks.md) for addresses.

---

