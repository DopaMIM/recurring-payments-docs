---
id: core-functions
title: Core Functions
sidebar_label: Core Functions
sidebar_position: 2
---

This page documents the main functions that **developers** will use when integrating the Blockhead Recurring Payments Protocol. Each entry includes a concise purpose, parameters/returns, and practical **ethers.js v6** snippets you can drop into your dApp.

> **Notes for all examples**
> - **Amounts:** pass `_amount` in the token’s **smallest unit** (respect `decimals()`).
> - **Allowances:** users should approve a **large or infinite** ERC-20 allowance to this contract so recurring pulls don’t fail.
> - **Time:** all times are in **seconds** (Unix timestamps).
> - **Automation:** the protocol’s automation runs payments; developers do **not** call internal automation functions.

---

## 1) `createRecurringPayment`

**Purpose**  
Create a new recurring subscription agreement.

**Signature**
```solidity
function createRecurringPayment(
  address _recipient,
  uint256 _amount,
  address _token,
  uint256 _timeIntervalSeconds,
  address _interface,
  string[] calldata _additionalInformation,
  uint256 _freeTrialTimeInSeconds
) external;
```

**Params**
- `_recipient` — merchant/service wallet to receive payments.  
- `_amount` — amount per interval in **token base units** (e.g., USDC uses 6 decimals).  
- `_token` — ERC-20 token address.  
- `_timeIntervalSeconds` — seconds between charges (see examples below).  
- `_interface` — **payment gateway UI** wallet; receives the fee share.  
- `_additionalInformation` — free-form metadata strings (keep short to save gas).  
- `_freeTrialTimeInSeconds` — optional free trial before the first charge.

**Emits**  
`RecurringPaymentCreated`

**Seconds quick reference**
- 1 day = `86_400`  
- 1 week = `604_800`  
- 1 month (30 days) = `2_592_000`  
- 1 year (365 days) = `31_536_000`

**Developer Experience (ethers.js v6)**
```ts
import { ethers } from "ethers";

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const CONTRACT_ADDRESS = "0xYourContract";
const CONTRACT_ABI = [ /* ABI here */ ];
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

const USDC = "0xTokenAddress";
const ERC20_ABI = [
  "function approve(address spender, uint256 value) external returns (bool)",
  "function decimals() view returns (uint8)"
];
const token = new ethers.Contract(USDC, ERC20_ABI, signer);

const recipient = "0xMerchant";
const uiInterfaceWallet = "0xUIWallet";
const humanAmount = "10";
const tokenDecimals = await token.decimals();
const amount = ethers.parseUnits(humanAmount, tokenDecimals);

const ONE_MONTH = 2_592_000;
const FREE_TRIAL_7_DAYS = 7 * 86_400;

await token.approve(CONTRACT_ADDRESS, ethers.MaxUint256);

const tx = await contract.createRecurringPayment(
  recipient,
  amount,
  USDC,
  ONE_MONTH,
  uiInterfaceWallet,
  ["customer_123", "plan_gold"],
  FREE_TRIAL_7_DAYS
);
await tx.wait();
```

---

## 2) `recurringPayments` (public mapping)

**Purpose**  
Fetch complete subscription details by `accountNumber`.

**Struct**
```solidity
struct RecurringPayment {
  uint256 accountNumber;
  address sender;
  address recipient;
  uint256 amount;
  address token;
  uint256 timeIntervalSeconds;
  address paymentInterface;
  string[] additionalInformation;
  uint256 paymentDue;
  bool canceled;
}
```

**Developer Experience**
```ts
const id = 0n;
const sub = await contract.recurringPayments(id);

const accountNumber        = sub[0];
const sender               = sub[1];
const recipient            = sub[2];
const amountBaseUnits      = sub[3];
const tokenAddress         = sub[4];
const intervalSeconds      = sub[5];
const paymentInterface     = sub[6];
const additionalInfo       = sub[7];
const paymentDueTimestamp  = sub[8];
const canceled             = sub[9];

const dec = await new ethers.Contract(tokenAddress, ["function decimals() view returns (uint8)"], provider).decimals();
const amountHuman = ethers.formatUnits(amountBaseUnits, dec);
```

---

## 3) `getAccountNumbersByAddress`

**Purpose**  
Return all subscriptions tied to an address.

**Signature**
```solidity
function getAccountNumbersByAddress(address accountAddress)
  external
  view
  returns (uint256[] memory);
```

**Developer Experience**
```ts
const ids = await contract.getAccountNumbersByAddress("0xUserOrMerchant");
const subs = await Promise.all(ids.map(async (id) => {
  const s = await contract.recurringPayments(id);
  return { id, s };
}));
```

---

## 4) `getPaymentDue`

**Purpose**  
Return the next scheduled charge timestamp.

**Signature**
```solidity
function getPaymentDue(uint256 accountNumber) external view returns (uint256);
```

**Developer Experience**
```ts
const nextTs = await contract.getPaymentDue(0n);
console.log("Next payment due:", new Date(Number(nextTs) * 1000));
```

---

## 5) `isSubscriptionValid`

**Purpose**  
Check if a subscription is active (includes 24-hour grace period).

**Signature**
```solidity
function isSubscriptionValid(uint256 accountNumber) external view returns (bool);
```

**Developer Experience**
```ts
const isValid = await contract.isSubscriptionValid(0n);
console.log("Subscription active?", isValid);
```

---

## 6) `cancelRecurringPayment`

**Purpose**  
Cancel a subscription (by payer, recipient, or owner).

**Signature**
```solidity
function cancelRecurringPayment(uint256 accountNumber) external;
```

**Developer Experience**
```ts
const tx = await contract.cancelRecurringPayment(0n);
await tx.wait();
```

---

## 7) `isPaymentCanceled`

**Purpose**  
Check if a subscription has been canceled.

**Signature**
```solidity
function isPaymentCanceled(uint256 accountNumber) external view returns (bool);
```

**Developer Experience**
```ts
const canceled = await contract.isPaymentCanceled(0n);
console.log("Canceled?", canceled);
```

---

## 8) `getCancelledAccounts`

**Purpose**  
Return all canceled subscriptions.

**Signature**
```solidity
function getCancelledAccounts() external view returns (uint256[] memory);
```

**Developer Experience**
```ts
const canceledIds = await contract.getCancelledAccounts();
console.log("Canceled accounts:", canceledIds);
```

---

## 9) `getAdditionalInformation`

**Purpose**  
Fetch metadata stored with the subscription.

**Signature**
```solidity
function getAdditionalInformation(uint256 accountNumber) external view returns (string[] memory);
```

**Developer Experience**
```ts
const info = await contract.getAdditionalInformation(0n);
console.log("Metadata:", info);
```
