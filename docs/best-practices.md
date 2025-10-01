---
id: best-practices
title: Best Practices & Quick Start
sidebar_label: Best Practices
sidebar_position: 5
---

This section provides a **step-by-step integration flow** and summarizes key best practices for developers building on the Blockhead Recurring Payments Protocol.

---

## Quick Start Example

A typical subscription flow has three steps:

### 1. User Approves Token Spend
Customers must grant the contract an allowance. Always request a **large or infinite approval** so recurring charges do not fail over time.

```ts
import { ethers } from "ethers";

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const USDC = "0xTokenAddress";
const CONTRACT_ADDRESS = "0xRecurringPaymentsContract";

const ERC20_ABI = ["function approve(address spender, uint256 value) external returns (bool)"];
const token = new ethers.Contract(USDC, ERC20_ABI, signer);

// Approve max allowance
await token.approve(CONTRACT_ADDRESS, ethers.MaxUint256);
```

---

### 2. Merchant Creates Subscription
Call `createRecurringPayment` with parameters for recipient, amount, token, interval, interface wallet, metadata, and optional free trial.

```ts
const CONTRACT_ABI = [ /* ...RecurringPayments ABI... */ ];
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

const recipient = "0xMerchantWallet";
const uiInterfaceWallet = "0xUIWallet";

// 10 USDC per month, 7-day free trial
const amount = ethers.parseUnits("10", 6); // USDC uses 6 decimals
const ONE_MONTH = 2_592_000; // 30 days in seconds
const FREE_TRIAL_7_DAYS = 7 * 86_400;

const tx = await contract.createRecurringPayment(
  recipient,
  amount,
  USDC,
  ONE_MONTH,
  uiInterfaceWallet,
  ["customer123", "plan_gold"], // optional metadata
  FREE_TRIAL_7_DAYS
);
await tx.wait();
```

---

### 3. Display Subscription Status
Frontends can query subscription state using `recurringPayments`, `getPaymentDue`, `isSubscriptionValid`, and related functions.

```ts
const id = 0n; // example account ID

const sub = await contract.recurringPayments(id);
console.log("Next payment due:", new Date(Number(sub[8]) * 1000));

const valid = await contract.isSubscriptionValid(id);
console.log("Subscription active?", valid);
```

---

## Best Practices

- **Approvals:** Request **large/infinite allowances**. Recurring charges will fail once allowance runs out.  
- **Token Units:** Always express `_amount` in the token’s **base unit**. Respect the token’s `decimals()`.  
- **Time:** All intervals and due dates are in **seconds**. Convert to days/weeks/months in UI.  
- **Free Trials:** Pass trial length in seconds (e.g., 7 days = `604800`).  
- **Metadata:** Keep `additionalInformation` concise to minimize gas fees. Store heavier data off-chain and link it via an ID.  
- **Grace Period:** Subscriptions remain valid for an extra 24 hours to handle chain delays. Do not revoke access immediately after a missed charge.  
- **Events:** Subscribe to `RecurringPaymentCreated`, `RecurringPaymentCancelled`, and `PaymentTransferred` to update your system in real time.  
- **Networks:** Verify the correct contract address for your target chain (see [Networks](./networks.md)).  

---

By following this flow and best practices, merchants and gateways can quickly enable recurring payments with minimal on-chain complexity.
