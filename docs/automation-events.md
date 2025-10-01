---
id: automation-events
title: Automation Layer — Events
sidebar_label: Events (Automation)
sidebar_position: 9
---

This page lists the on-chain events emitted by the **Automation Layer** and how to consume them from apps/indexers.

> Heads up: Builders **do not** need to read these events to integrate automation (the `id` you pass is echoed back to your contract during `checkSimpleAutomation`/`simpleAutomation`). Events are useful for **dashboards, analytics, notifications, and audits**.

---

## Event Reference

### `AccountCreated`
Emitted when a contract registers a new automated account with `createAccount(id)`.

```solidity
event AccountCreated(address indexed customer);
```

- **`customer`** — the calling contract address that registered the account.
- ⚠️ **Does not include** the internal `accountNumber` or your `id`.
  - If you need to identify the new internal `accountNumber`, call `getAccountsByAddress(customer)` and compare before/after.
  - Most builders don’t need this number; keep using your own `id` for routing inside your contract.

---

### `AccountCancelled`
Emitted when the registering contract calls `cancelAccount(id)`.

```solidity
event AccountCancelled(uint256 indexed index, address indexed account);
```

- **`index`** — internal `accountNumber` used by the Automation Layer.
- **`account`** — the registering contract address.
- Notes:
  - On cancel, the Automation Layer refunds the stored **account creation fee** (in the current fee token) from the owner to the registering contract.
  - The owner must have granted allowance to the Automation Layer for refunds to succeed.

---

### `TransactionSuccess`
Emitted when a node successfully executes automation for an account via `simpleAutomation(accountNumber)`.

```solidity
event TransactionSuccess(uint256 indexed index);
```

- **`index`** — internal `accountNumber`.
- Semantics:
  - This event is emitted **before** the Automation Layer calls your contract’s `simpleAutomation(id)` and charges the fee;  
    however, if anything later in the transaction **reverts**, the event is **rolled back** and will **not** appear in logs.
  - Therefore, observing `TransactionSuccess` in the logs implies the **entire automation transaction succeeded** (your action ran and the fee was paid).

---

## Consuming Events (ethers v6)

```ts
import { ethers } from "ethers";

// 1) Minimal ABI for events you care about
const automationAbi = [
  "event AccountCreated(address indexed customer)",
  "event AccountCancelled(uint256 indexed index, address indexed account)",
  "event TransactionSuccess(uint256 indexed index)",
];

// 2) Connect to the Automation Layer on your network
const automation = new ethers.Contract(
  /* AUTOMATION_LAYER_ADDRESS */,
  automationAbi,
  /* provider or signer */
);

// AccountCreated: show which contract registered
automation.on("AccountCreated", (customer, ev) => {
  console.log("AccountCreated by:", customer, "tx:", ev.transactionHash);
});

// AccountCancelled: map internal accountNumber -> contract address
automation.on("AccountCancelled", (index, account, ev) => {
  console.log("AccountCancelled:", index.toString(), "by:", account, "tx:", ev.transactionHash);
});

// TransactionSuccess: a successful automated run
automation.on("TransactionSuccess", (index, ev) => {
  console.log("TransactionSuccess for accountNumber:", index.toString(), "tx:", ev.transactionHash);
});
```

**Filtering by address or block range**
```ts
const from = /* start block */;
const to   = /* end block */;

// Query past events
const txSuccessFilter = automation.filters.TransactionSuccess();
const logs = await automation.queryFilter(txSuccessFilter, from, to);
logs.forEach((log) => console.log("Success index:", log.args.index.toString()));
```

---

## When to Listen

- **Dashboards & UX:** Show recent automation activity (using `TransactionSuccess`) for a given builder contract.
- **Alerts:** Notify when an account is canceled (`AccountCancelled`) or when expected runs are missing.
- **Ops & Analytics:** Track adoption by counting `AccountCreated` over time per network.

---

## Tips & Caveats

- **You don’t need events to drive your contract logic.** Your own `id` flows through the automation hooks you implement:
  - `checkSimpleAutomation(id)` and `simpleAutomation(id)` receive the **same `id`** you registered with `createAccount(id)`.
- **Internal `accountNumber` vs your `id`:**
  - The Automation Layer uses an internal `accountNumber` for bookkeeping and node calls.
  - Your contract never needs to know that `accountNumber`; keep your own `id` mapping.
- **Indexing at scale:**
  - Consider using The Graph or similar to index events across networks, keyed by `account` (the builder contract) and `index` (internal account number).
- **Refund path on cancel:**
  - `AccountCancelled` indicates a logical cancel. If you’re tracking fee balances, remember the refund transfers from **owner → account** in the fee token.

---

## See Also

- **[Automation Layer — Overview](./automation-overview.md)**: Big picture, fee model, and use cases.  
- **[Automation Layer — Core Functions](./automation-core.md)**: Exact function signatures, approvals, and examples.  
- **Networks** (coming next): Per-chain **Automation Layer** & **fee token** addresses.
