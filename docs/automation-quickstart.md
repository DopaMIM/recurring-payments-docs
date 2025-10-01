---
id: automation-quickstart
title: Automation Layer — Quick Start
sidebar_label: Quick Start (Automation)
sidebar_position: 11
---

Get up and running with the **Automation Layer** in minutes. This guide gives you:
- a minimal **Solidity skeleton**,
- a **step-by-step** checklist,
- copy-paste **client scripts** to register, approve, and cancel.

> TL;DR  
> Pick a **non-zero unique `id`** per unit of work, register it with `createAccount(id)`, expose `checkSimpleAutomation(id)` and `simpleAutomation(id)`, and approve the Automation Layer to spend the **active fee token** (USDC today).

---

## 1) Install minimal interfaces (copy/paste)

Add these to your contract or a shared `interfaces/` file.

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
  function checkSimpleAutomation(uint256 accountNumber) external view returns (bool);
  function isAccountCanceled(uint256 accountNumber) external view returns (bool);

  // Active fee token address (named `duh` in the contract; treat as feeToken())
  function duh() external view returns (address);
}

// Hooks your contract must implement (called by nodes)
interface Automate {
  function simpleAutomation(uint256 id) external;
  function checkSimpleAutomation(uint256 id) external view returns (bool);
}
```

---

## 2) Minimal contract skeleton (ready to compile)

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "./Interfaces.sol"; // or inline the interfaces above

contract MyAutomatedContract is Automate {
  address public automationLayer;     // set after deploy
  uint256 public nextId = 1;          // ensure IDs are non-zero & unique

  // Example schedule state (optional)
  mapping(uint256 => uint256) public nextDue;
  uint256 public interval = 7 days;

  /* ---------- Setup ---------- */

  /// @notice Approve the **current** fee token (USDC today) used by the Automation Layer
  function approveCurrentFeeToken(uint256 amount) external {
    address feeToken = IAutomationLayer(automationLayer).duh(); // USDC address today
    require(IERC20(feeToken).approve(automationLayer, amount), "approve failed");
  }

  /// @notice (Optional) Approve any ERC-20 as fee token (future-proof)
  function approveFeesFor(address token, uint256 amount) external {
    require(IERC20(token).approve(automationLayer, amount), "approve failed");
  }

  /* ---------- Register / Cancel ---------- */

  /// @notice Register a new automated job; picks a new non-zero id
  function register() external {
    uint256 id = nextId++;
    nextDue[id] = block.timestamp + interval; // example schedule
    IAutomationLayer(automationLayer).createAccount(id);
  }

  function cancel(uint256 id) external {
    IAutomationLayer(automationLayer).cancelAccount(id);
  }

  /* ---------- Automation Hooks (called by nodes) ---------- */

  function checkSimpleAutomation(uint256 id) external view returns (bool) {
    // Keep cheap & deterministic; return true only when action will succeed
    return block.timestamp >= nextDue[id];
  }

  function simpleAutomation(uint256 id) external {
    // Your action. Make idempotent / guarded within your own period.
    // e.g., transfer/mint/settle/etc.
    nextDue[id] = block.timestamp + interval;
  }

  /* ---------- Admin wiring ---------- */

  function setAutomationLayer(address a) external {
    // add your own access control
    automationLayer = a;
  }

  function setInterval(uint256 newInterval) external {
    // add your own access control
    interval = newInterval;
  }
}
```

> **Rule:** `id` must be **> 0** and **unique per calling contract**. The same `id` is echoed back into your hooks, so you never need the internal `accountNumber`.

---

## 3) Deployment wiring (per network)

Set `automationLayer` to the address from **Networks (Automation)**:

| Network     | AutomationLayer                                   | Fee token (USDC)                                |
|-------------|----------------------------------------------------|-------------------------------------------------|
| Polygon     | `0x5fc876A1e9BB3f6c76990C4248b23F1B64E3c8dB`       | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`    |
| Optimism    | `0x1Bb81875e6133a4791a8FaB68aF6e455de9E1B04`       | `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85`    |
| Base        | `0x1Bb81875e6133a4791a8FaB68aF6e455de9E1B04`       | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`    |
| Arbitrum    | `0x1Bb81875e6133a4791a8FaB68aF6e455de9E1B04`       | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`    |

> You can always read the **current** fee token via `IAutomationLayer.duh()`.

---

## 4) Client snippets (ethers v6)

### Approve fees (Max) & register

```ts
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer   = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

// ABIs (minimal)
const automationAbi = [
  "function createAccount(uint256 id) external",
  "function cancelAccount(uint256 id) external",
  "function duh() view returns (address)"
];
const erc20Abi = [
  "function approve(address spender, uint256 value) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

// Addresses
const automation = new ethers.Contract(
  "AUTOMATION_LAYER_ADDRESS",
  automationAbi,
  signer
);

// 1) Discover current fee token
const feeTokenAddr: string = await automation.duh();
const feeToken = new ethers.Contract(feeTokenAddr, erc20Abi, signer);

// 2) Approve Max
await feeToken.approve(automation.target as string, ethers.MaxUint256);

// 3) Register (choose a non-zero unique id in your contract’s namespace)
const myId = 1n; // example; your contract should also store/expect this id
await (await automation.createAccount(myId)).wait();
console.log("Registered id:", myId.toString());
```

### Cancel an account

```ts
await (await automation.cancelAccount(1n)).wait();
console.log("Cancelled id 1");
```

---

## 5) Local/manual testing (without nodes)

Because nodes **precheck** before calling, you can simulate the flow locally:

1. **Call your contract’s** `checkSimpleAutomation(id)` → expect `true` when ready.
2. Pretend a node calls **your** `simpleAutomation(id)`:
   - In production, the Automation Layer calls your hook **and** pulls the fee from **your contract**.
   - Locally, focus on your hook correctness (state transitions, idempotence).
3. Verify allowance/balances for the fee token:
   - Ensure your contract has enough **USDC** and has approved the Automation Layer.

---

## 6) Checklist (copy/paste)

- [ ] Use **non-zero, unique** `id` values per unit of work.
- [ ] Implement `checkSimpleAutomation(id)` (**view**, cheap, deterministic).
- [ ] Implement `simpleAutomation(id)` (safe & idempotent).
- [ ] Call `createAccount(id)` from **your** contract to register.
- [ ] Approve the **active fee token** (read via `automationLayer.duh()`).
- [ ] Fund your contract with enough **fee token** to cover runs.
- [ ] Provide a `cancelAccount(id)` path when automation is no longer needed.
- [ ] (Optional) Index events for dashboards: `AccountCreated`, `TransactionSuccess`, `AccountCancelled`.

---

## 7) Gotchas & tips

- **Don’t use `id = 0`.** Start at 1 and increment or manage uniqueness explicitly.
- **USDC decimals = 6.** Multiply human amounts by `1e6` when transferring/approving.
- **Allowance patterns.** Some ERC-20s require setting allowance to `0` before increasing; consider approving `MaxUint256` once.
- **Avoid reentrancy.** If your action touches external contracts, follow checks-effects-interactions, or add reentrancy guards.
- **Determinism matters.** `checkSimpleAutomation` should be predictable from on-chain state; don’t rely on off-chain conditions.

---

### See also
- **[Automation Overview](./automation-overview.md)** — Big picture, fee model, use cases  
- **[Core Functions](./automation-core.md)** — Exact signatures, approvals, examples  
- **[Events](./automation-events.md)** — Emitted events and how to consume them  
- **[Networks](./automation-networks.md)** — Per-chain addresses & fee token
