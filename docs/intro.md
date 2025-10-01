---
id: overview
title: Overview
sidebar_label: Overview
sidebar_position: 1
---

The **Blockhead Recurring Payments Protocol** enables payment gateways to connect their user interfaces directly to this contract to immediately enable recurring payments. Gateways that integrate with the protocol not only unlock subscription billing but also **share in the transaction fees** collected by the protocol, while the protocol itself handles the heavy lifting of processing transactions.  

---

## Key Functions and How They Help

### Create Recurring Payment
Merchants use `createRecurringPayment` to start a subscription. Customers only need to approve tokens once, and the subscription runs automatically. Payment gateways benefit by offering recurring billing without building the complex infrastructure themselves.  

### RecurringPayment Struct
Each subscription is stored on-chain with all relevant details: payer, recipient, token, amount, interval, metadata, and status. Gateways can use this to power dashboards, billing history, or analytics tools.  

### Account Lookup
`getAccountNumbersByAddress` allows a user or merchant to retrieve all subscriptions tied to an address. This makes it easy for gateways to build “Manage My Subscriptions” pages.  

### Next Payment Due
`getPaymentDue` returns the timestamp (in seconds) of the next scheduled payment. Gateways can convert this into a friendly message like *“Your next payment is due in 3 days.”*  

### Validity Check
`isSubscriptionValid` verifies whether a subscription is active, with a built-in **24-hour grace period** to handle blockchain congestion or transaction delays. This ensures customers don’t lose access prematurely.  

### Cancellation
Subscriptions can be canceled by either the payer or the merchant using `cancelRecurringPayment`. This supports consumer choice (like canceling Netflix) and gives merchants control to revoke access if needed.  

### Cancellation History
`getCancelledAccounts` provides a list of all canceled subscriptions. Gateways can use this for reporting, churn analysis, or reconciliation.  

### Metadata
`getAdditionalInformation` retrieves developer-defined metadata (e.g., customer IDs, product SKUs, or subscription references). This allows gateways to link on-chain subscriptions back to off-chain systems, while keeping data lightweight for lower gas costs.  

### Events
The contract emits three key events:  
- **RecurringPaymentCreated**  
- **RecurringPaymentCancelled**  
- **PaymentTransferred**  

Gateways can listen for these to update dashboards, send notifications, or trigger service access changes when payments succeed or fail.  

### Networks
The protocol is deployed on **Optimism, Base, Polygon, and Arbitrum**, enabling gateways to support recurring payments across multiple ecosystems with a single integration.  

### Best Practices
- Approve large or infinite ERC-20 allowances so subscriptions don’t fail over time.  
- Always express amounts in the smallest token units (respect token decimals).  
- Convert all time values from seconds into human-readable formats in UIs.  
- Keep `additionalInformation` fields concise to minimize gas fees.  

---
