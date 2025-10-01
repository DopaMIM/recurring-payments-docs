---
id: automation-overview
title: Automation Layer — Overview
sidebar_label: Automation Overview
sidebar_position: 7
---
## ***This section is for adding automation to smart contracts. It is not relevent to the recurring Payments.***

The **Automation Layer** is a lightweight on-chain “keeper” that lets you **automate any smart contract function** with just a few lines of code. It powers our Recurring Payments Protocol, but it’s intentionally **generic** so you can automate your own contracts the same way—no cron servers, no off-chain bots to maintain.

At a high level:
- You **register** an account to automate (with a unique non-zero `id` you choose).
- You implement two tiny functions: **`checkSimpleAutomation(id)`** (view → `bool`) and **`simpleAutomation(id)`** (the action).
- The network of node operators continuously **pre-checks** your accounts. When ready, they call your action function.
- A small **fee** is charged **per account creation** and **per automated call** (paid from your contract to the node/protocol). If the fee can’t be paid, nodes **won’t** call your function.

---

## Why use it?

- **Zero DevOps:** No centralized schedulers or off-chain cron jobs to run.
- **Deterministic:** Your “should I run?” logic lives on-chain in `checkSimpleAutomation`.
- **Composable:** Works with **any** contract—you decide what to automate.
- **Cost-aware:** Nodes precheck for success; they don’t waste gas calling actions that would revert due to missing fees or failing conditions.

---

## How it works (mental model)

1. **You pick an ID** → For each thing you want automated, you pick a **non-zero, unique** `id` in your contract’s namespace (e.g., subscription ID, vesting ID).
2. **Register** → Call `AutomationLayer.createAccount(id)` from **your contract**. (You’ll pay an **account creation fee**.)
3. **Check → Act** → You expose:
   - `checkSimpleAutomation(id) → bool` — **When true**, a node may call `simpleAutomation`.
   - `simpleAutomation(id)` — your actual work (transfer, mint, settle, etc.).
4. **Fees** → On each successful action, your contract pays a per-call **automation fee** to the node. Nodes **precheck** balances/allowances and will **not** call if fees would fail.
5. **Cancel** → When you’re done, you may call `AutomationLayer.cancelAccount(id)` from **your contract** to stop automation.

> ℹ️ Internally, the Automation Layer assigns an `accountNumber` to your `(contract, id)` pair. You do **not** need this number to integrate—your **own `id` is echoed back** to your contract in both `checkSimpleAutomation(id)` and `simpleAutomation(id)`.

---

## What you implement (in your contract)

Minimal surface:
- `function checkSimpleAutomation(uint256 id) external view returns (bool)`
- `function simpleAutomation(uint256 id) external`
- A function in your contract to **register**: `AutomationLayer(automationLayerAddr).createAccount(id);`
- (Optional) A function in your contract to **cancel**: `AutomationLayer(automationLayerAddr).cancelAccount(id);`
- A function to **approve** the Automation Layer to spend the **fee token** from **your contract** (see “Fee model” below).

**Design tips**
- Keep `checkSimpleAutomation` **pure/cheap**—return `true` only when your action will succeed.
- Make `simpleAutomation` **idempotent** or safely guarded so a second call in the same period won’t cause harm.
- Store any required state so your check/action logic is **deterministic**.

---

## Fee model (current: USDC; future-compatible)

Today, the fee token is **USDC** on supported networks. In future, we may use a **protocol utility token**. To avoid code changes later, implement your approval logic to work with **any ERC-20**.

- **Account creation:** when you call `createAccount(id)`, the Automation Layer transfers the **account creation fee** from **your contract** to the protocol owner.
- **Per action:** each successful `simpleAutomation` pays the **automation fee** from **your contract** to the **calling node**.
- **Refund on cancel:** when you call `cancelAccount(id)`, the Automation Layer refunds the stored **accountCreationFee** from the owner back to **your contract**.
- **Allowances required:**
  - Your contract must approve the Automation Layer to **spend the fee token** on its behalf.
  - The owner separately approves the Automation Layer to **spend the fee token for refunds** (not your concern as a builder).
- **Node prechecks:** Nodes won’t call `simpleAutomation` if the fee or your action would fail.

> **Future-proof tip:** Read the current fee token address from the Automation Layer and approve **that** token. In code, the public variable is named `duh` in the contract; treat it as **the fee token address** (currently USDC).

**Generic approval (recommended)**
```solidity
interface IERC20 {
  function approve(address spender, uint256 value) external returns (bool);
}

interface IAutomationLayerFeeToken {
  function duh() external view returns (address); // current fee token (USDC today)
}

contract MyAutomatedContract {
  address public automationLayerAddress;

  /// @notice Approve the Automation Layer to spend fees in ANY ERC-20 token.
  /// Pass amount=type(uint256).max for "infinite" allowance.
  function approveAutomationFeesFor(address token, uint256 amount) external {
    require(IERC20(token).approve(automationLayerAddress, amount), "approve failed");
  }

  /// @notice Convenience helper: approve the CURRENT fee token used by the Automation Layer.
  function approveCurrentFeeToken(uint256 amount) external {
    address feeToken = IAutomationLayerFeeToken(automationLayerAddress).duh(); // USDC today
    require(IERC20(feeToken).approve(automationLayerAddress, amount), "approve failed");
  }
}
```

> **Allowance gotcha:** Some ERC-20s (e.g., USDC) may require setting allowance to `0` before increasing. Use your token’s recommended pattern, or approve **MaxUint256** once.

---

## Common automation use cases

- **Subscriptions / Billing** — pull payments on schedule, extend access, write invoices (as used by our Recurring Payments Protocol).
- **Vesting / Unlocks** — release tokens once a cliff passes or on periodic cadence.
- **Interest Harvesting** — auto-compound rewards when a threshold is met.
- **Rebalancing** — move liquidity or collateral when ratios drift.
- **Upkeep / Oracles** — refresh state on price deviation/time elapsed.
- **Auctions / Dutch drops** — progress phases at block-time checkpoints.
- **NFT Rentals** — expire or renew rentals automatically.

---

## Example integration (Solidity)

Below is a minimal skeleton showing the pattern. Replace logic with your own; keep IDs **non-zero & unique**.

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

interface AutomationLayer {
  function createAccount(uint256 id) external;
  function cancelAccount(uint256 id) external;
  function duh() external view returns (address); // fee token
}

interface IERC20 {
  function approve(address spender, uint256 amount) external returns (bool);
  function transferFrom(address src, address dst, uint256 amount) external returns (bool);
}

contract MyAutomatedContract {
  address public automationLayerAddress;
  uint256 public nextId = 1; // ensure non-zero, unique IDs

  /* -------- Fees (future-proof) -------- */

  function approveCurrentFeeToken(uint256 amount) external {
    address feeToken = AutomationLayer(automationLayerAddress).duh(); // USDC today
    require(IERC20(feeToken).approve(automationLayerAddress, amount), "
