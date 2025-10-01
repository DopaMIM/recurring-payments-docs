---
id: events
title: Events
sidebar_label: Events
sidebar_position: 3
---

This page documents the events emitted by the Blockhead Recurring Payments Protocol. You can subscribe to these events to update dashboards, analytics, and user notifications in real time.

> **Notes**
> - Use **indexed** topics to filter efficiently (e.g., by `sender` or `recipient`).
> - `additionalInformation` is an array of strings; keep it **short and consistent** if you plan to index it off-chain.
> - Timestamps and intervals are in **seconds**.

---

## Event: `RecurringPaymentCreated`

**Definition**
```solidity
event RecurringPaymentCreated(
  uint256 accountNumber,
  address indexed sender,
  address indexed recipient,
  uint256 amount,
  address token,
  uint256 timeIntervalSeconds,
  address indexed paymentInterface,
  string[] additionalInformation,
  uint256 paymentDue,
  bool canceled
);
```

**When it fires**  
Emitted after a successful `createRecurringPayment` call.

**How to use it**
- Initialize subscription records in your database.
- Display confirmation to the user and show the first `paymentDue` time.
- Attribute fee share by `paymentInterface`.

**ethers.js v6 listener**
```ts
import { ethers } from "ethers";

const provider = new ethers.WebSocketProvider("wss://your_rpc");
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

// Listen for ALL creations
contract.on("RecurringPaymentCreated", (
  accountNumber,
  sender,
  recipient,
  amount,
  token,
  timeIntervalSeconds,
  paymentInterface,
  additionalInformation,
  paymentDue,
  canceled,
  event
) => {
  console.log("Created:", {
    accountNumber: accountNumber.toString(),
    sender, recipient, amount: amount.toString(), token,
    timeIntervalSeconds: timeIntervalSeconds.toString(),
    paymentInterface,
    additionalInformation,
    paymentDue: Number(paymentDue),
    canceled
  });
});
```

**Filter by creator (sender)**
```ts
// Build a topic filter using indexed params: sender, recipient, paymentInterface
const sender = "0xSenderAddress";
const filter = contract.filters.RecurringPaymentCreated(null, sender);
const logs = await contract.queryFilter(filter, -10_000); // last ~10k blocks
```

---

## Event: `RecurringPaymentCancelled`

**Definition**
```solidity
event RecurringPaymentCancelled(
  uint256 indexed index,
  address indexed sender,
  address indexed recipient
);
```

**When it fires**  
Emitted when a subscription is canceled by the payer, the merchant, or the contract owner.

**How to use it**
- Immediately reflect cancellation in UI (“Canceled” state).
- Revoke access to gated content/services.
- Update churn analytics.

**ethers.js v6 listener**
```ts
contract.on("RecurringPaymentCancelled", (index, sender, recipient, event) => {
  console.log("Canceled:", {
    accountNumber: index.toString(), sender, recipient
  });
});
```

**Filter by recipient (merchant)**
```ts
const merchant = "0xMerchantAddress";
const filter = contract.filters.RecurringPaymentCancelled(null, null, merchant);
const logs = await contract.queryFilter(filter, 0, "latest");
```

---

## Event: `PaymentTransferred`

**Definition**
```solidity
event PaymentTransferred(uint256 indexed index);
```

**When it fires**  
Emitted each time an automated payment execution occurs for a subscription.

**How to use it**
- Update billing history and invoice records.
- Notify users (email/Discord/Telegram) that a payment succeeded.
- Trigger fulfillment (extend access, ship goods, etc.).

**ethers.js v6 listener**
```ts
contract.on("PaymentTransferred", (index, event) => {
  console.log("Payment executed for account:", index.toString());
});
```

**Historical query for a single subscription**
```ts
const accountId = 123n;
const filter = contract.filters.PaymentTransferred(accountId);
const executions = await contract.queryFilter(filter, 0, "latest");
console.log("Total executions:", executions.length);
```

---

## ABI Fragments for Events

If you keep a trimmed ABI for listeners, include at least:
```json
[
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "accountNumber", "type": "uint256" },
      { "indexed": true,  "internalType": "address", "name": "sender", "type": "address" },
      { "indexed": true,  "internalType": "address", "name": "recipient", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "token", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timeIntervalSeconds", "type": "uint256" },
      { "indexed": true,  "internalType": "address", "name": "paymentInterface", "type": "address" },
      { "indexed": false, "internalType": "string[]", "name": "additionalInformation", "type": "string[]" },
      { "indexed": false, "internalType": "uint256", "name": "paymentDue", "type": "uint256" },
      { "indexed": false, "internalType": "bool",    "name": "canceled", "type": "bool" }
    ],
    "name": "RecurringPaymentCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "index", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "sender", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }
    ],
    "name": "RecurringPaymentCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "index", "type": "uint256" }
    ],
    "name": "PaymentTransferred",
    "type": "event"
  }
]
```

---

## Practical Tips

- **Indexing strategy:** Keep `additionalInformation` concise and stable if you plan to parse it; store heavy metadata off-chain and reference IDs in this array.
- **Backfilling history:** Use `queryFilter` with appropriate block ranges to rebuild state in your database.
- **Rate limits:** Prefer WebSocket providers for real-time listeners; fall back to HTTP polling if needed.

---
