---
id: automation-core
title: Automation Layer — Core Functions
sidebar_label: Core Functions (Automation)
sidebar_position: 8
---

This page documents what **builders** call on the **Automation Layer** and what they must **implement** in their own contracts to get automated execution.

> **Quick model**
> - You choose a **non-zero unique `id`** per unit of work in **your** contract.
> - You **register** that `id` with `createAccount(id)` (fee in the **active fee token** — **USDC today**).
> - You implement **two hooks** in your contract:
>   - `checkSimpleAutomation(id) → bool` (view): return `true` only when it’s safe to run.
>   - `simpleAutomation(id)`: your action logic (runs when `check == true`).
> - You can **cancel** later with `cancelAccount(id)`.

---

## Interfaces you implement (in your contract)

```solidity
interface Automate {
  function simpleAutomation(uint256 id) external;
  function checkSimpleAutomation(uint256 id) external view returns (bool);
}
```

**Rules**
- `id` **must be > 0** and **unique per calling contract**.
- The **same `id`** is echoed back to your contract on both calls, so you don’t need the Automation Layer’s internal `accountNumber`.

---

## Functions you call on the Automation Layer

### 1) `createAccount`

**Purpose**  
Register a new automated account for your `(contract, id)` pair.

**Signature**
```solidity
function createAccount(uint256 id) external;
```

**Behavior & Fees**
- Transfers the **account creation fee** (in the **active fee token**) from **your contract** to the protocol owner.
- Assigns an internal `accountNumber` (you don’t need it for your logic).
- Emits `AccountCreated(address customer)`.

**Requirements**
- Your contract must hold the **fee token** and must have **approved** the Automation Layer as spender.
- `id` must be **non-zero** and **unique** for your contract.

**Snippet (your contract)**
```solidity
AutomationLayer(automationLayerAddress).createAccount(myId);
```

---

### 2) `cancelAccount`

**Purpose**  
Stop future automation for `(address, id)`.

**Signature**
```solidity
function cancelAccount(uint256 id) external;
```

**Behavior**
- Marks the account as canceled.
- Refunds the stored **accountCreationFee** (in fee token) from the owner back to **your contract**.
- Emits `AccountCancelled(uint256 accountNumber, address account)`.

**Requirements**
- Must be called **by the same contract** that created the account (`msg.sender` check).

**Snippet**
```solidity
AutomationLayer(automationLayerAddress).cancelAccount(myId);
```

---

### 3) `getAccountsByAddress`

**Purpose**  
List all internal `accountNumber`s associated with an address (useful for indexing/debugging).

**Signature**
```solidity
function getAccountsByAddress(address accountAddress)
  external
  view
  returns (uint256[] memory);
```

**Example (ethers v6)**
```ts
const accounts = await automation.getAccountsByAddress(myContractAddress);
console.log(accounts);
```

---

### 4) `checkSimpleAutomation` (Automation Layer view)

**Purpose**  
For a given **`accountNumber`**, returns whether that account is eligible to run **right now**. Nodes call this; you can, too, for diagnostics.

**Signature**
```solidity
function checkSimpleAutomation(uint256 accountNumber)
  external
  view
  returns (bool);
```

---

### 5) `isAccountCanceled`

**Purpose**  
Query if an account is canceled.

**Signature**
```solidity
function isAccountCanceled(uint256 accountNumber)
  external
  view
  returns (bool);
```

---

### 6) `getCancelledAccounts`

**Purpose**  
Return all canceled `accountNumber`s.

**Signature**
```solidity
function getCancelledAccounts() external view returns (uint256[] memory);
```

---

## What nodes call on **your** contract

You implement these; nodes will call them:

### `checkSimpleAutomation`

Keep it **cheap**, **deterministic**, and return `true` only when your action will succeed.

```solidity
function checkSimpleAutomation(uint256 id) external view returns (bool) {
  // Example:
  // return block.timestamp >= nextDue[id] && balance[id] >= threshold[id];
  return _isReady(id);
}
```

### `simpleAutomation`

Your action. Must succeed when `checkSimpleAutomation(id)` returns true.

```solidity
function simpleAutomation(uint256 id) external {
  // Do work: transfer/mint/settle/etc.
  _doWork(id);
}
```

> **Tip:** Make the action idempotent or guard it so repeated calls within the same window can’t cause harm.

---

## Active fee token (today: **USDC**) & approvals

The Automation Layer uses a **fee token** address stored on-chain (named `duh` in the contract). **Treat `duh()` as “feeToken()”.**  
To be future-proof (in case the protocol changes the fee token later), **read the token from the Automation Layer** and approve that token.

**Minimal interface**
```solidity
interface IERC20 {
  function approve(address spender, uint256 amount) external returns (bool);
}
interface AutomationLayer {
  function duh() external view returns (address); // current fee token (USDC today)
}
```

**Generic approvals (recommended)**
```solidity
contract MyAutomatedContract {
  address public automationLayerAddress;

  /// Approve any ERC-20 as the fee token (future-proof).
  function approveAutomationFeesFor(address token, uint256 amount) external {
    require(IERC20(token).approve(automationLayerAddress, amount), "approve failed");
  }

  /// Approve the CURRENT fee token used by the Automation Layer (USDC today).
  function approveCurrentFeeToken(uint256 amount) external {
    address feeToken = AutomationLayer(automationLayerAddress).duh();
    require(IERC20(feeToken).approve(automationLayerAddress, amount), "approve failed");
  }
}
```

**Ethers example (read fee token & approve Max):**
```ts
const feeToken = await automation.duh(); // USDC today
const erc20 = new ethers.Contract(feeToken, ['function approve(address,uint256) returns (bool)'], signer);
await erc20.approve(automationAddress, ethers.MaxUint256);
```

> **Node prechecks:** If allowance/balance is insufficient, nodes won’t call your action.

---

## Practical skeleton (Solidity)

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

interface IERC20 {
  function approve(address spender, uint256 amount) external returns (bool);
  function transferFrom(address src, address dst, uint256 amount) external returns (bool);
}
interface IAutomationLayer {
  function createAccount(uint256 id) external;
  function cancelAccount(uint256 id) external;
  function duh() external view returns (address); // fee token (USDC today)
}

contract MyAutomated {
  address public automationLayerAddress; // set on deploy/init
  uint256 public nextId = 1;             // ensure non-zero, unique IDs

  mapping(uint256 => uint256) public nextDue;
  uint256 public interval = 30 days;

  /* ---- Approvals ---- */
  function approveCurrentFeeToken(uint256 amount) external {
    address feeToken = IAutomationLayer(automationLayerAddress).duh();
    require(IERC20(feeToken).approve(automationLayerAddress, amount), "approve failed");
  }

  /* ---- Register / Cancel ---- */
  function register() external {
    uint256 id = nextId++;
    nextDue[id] = block.timestamp + interval;
    IAutomationLayer(automationLayerAddress).createAccount(id);
  }

  function cancel(uint256 id) external {
    IAutomationLayer(automationLayerAddress).cancelAccount(id);
  }

  /* ---- Automation Hooks ---- */
  function checkSimpleAutomation(uint256 id) external view returns (bool) {
    return block.timestamp >= nextDue[id];
  }

  function simpleAutomation(uint256 id) external {
    // …perform work…
    nextDue[id] = block.timestamp + interval;
  }
}
```

---

## Events (emitted by the Automation Layer)

```solidity
event AccountCreated(address indexed customer);
event AccountCancelled(uint256 indexed index, address indexed account);
event TransactionSuccess(uint256 indexed index);
```

**Notes**
- `AccountCreated` does **not** include your `id` or the internal `accountNumber`. If you need the `accountNumber` off-chain, read `getAccountsByAddress(yourContractAddress)` and compare before/after.
- `TransactionSuccess(index)` indicates an automation ran for that `accountNumber`.

---

## Networks (Automation Layer + USDC)

> The fee token is **USDC** on all supported networks today.

| Network     | AutomationLayer Address                           | USDC (fee token)                                |
|-------------|----------------------------------------------------|-------------------------------------------------|
| **Polygon** | `0x5fc876A1e9BB3f6c76990C4248b23F1B64E3c8dB`       | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`    |
| **Optimism**| `0x1Bb81875e6133a4791a8FaB68aF6e455de9E1B04`       | `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85`    |
| **Base**    | `0x1Bb81875e6133a4791a8FaB68aF6e455de9E1B04`       | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`    |
| **Arbitrum**| `0x1Bb81875e6133a4791a8FaB68aF6e455de9E1B04`       | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`    |

> Builders do **not** interact with the sequencer; it’s managed by the protocol.

---

## Troubleshooting

- **“Fee transfer failed.”** Ensure your contract holds enough **fee token** and has granted sufficient **allowance** to the Automation Layer.  
- **Action not triggering.** Verify `checkSimpleAutomation(id)` returns `true` and your action won’t revert.  
- **Nothing happens after register.** Confirm approvals, balances, and addresses match the **Networks** table.

---
