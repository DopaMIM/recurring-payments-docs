---
id: automation-networks
title: Automation Layer — Networks & Addresses
sidebar_label: Networks (Automation)
sidebar_position: 10
---

This page lists the **Automation Layer** contract address and the **fee token (USDC)** per supported network. Builders do **not** need the Sequencer address; it’s used internally by the protocol.

> **Fee token today:** USDC on all networks below.  
> **Future-proofing:** Read the active fee token from the Automation Layer (`duh()`), and approve that token for fees.

---

## Addresses

| Network     | AutomationLayer                                   | USDC (fee token)                                | USDC Decimals |
|-------------|----------------------------------------------------|-------------------------------------------------|---------------|
| **Polygon** | `0x5fc876A1e9BB3f6c76990C4248b23F1B64E3c8dB`       | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`    | 6             |
| **Optimism**| `0x1Bb81875e6133a4791a8FaB68aF6e455de9E1B04`       | `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85`    | 6             |
| **Base**    | `0x1Bb81875e6133a4791a8FaB68aF6e455de9E1B04`       | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`    | 6             |
| **Arbitrum**| `0x1Bb81875e6133a4791a8FaB68aF6e455de9E1B04`       | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`    | 6             |

> If you see the variable name `duh` in code, treat it as **“fee token address”**. For current deployments, it equals **USDC** on each network above.

---

## Reading the active fee token from the contract

Even though the fee token is USDC today, the safest pattern is to **query the Automation Layer** for the active token and approve that token.

```solidity
interface IAutomationLayer {
  function duh() external view returns (address); // current fee token (USDC today)
}

interface IERC20 {
  function approve(address spender, uint256 amount) external returns (bool);
}

contract MyAutomatedContract {
  address public automationLayerAddress;

  /// Approve the CURRENT fee token (read from the Automation Layer)
  function approveCurrentFeeToken(uint256 amount) external {
    address feeToken = IAutomationLayer(automationLayerAddress).duh();
    require(IERC20(feeToken).approve(automationLayerAddress, amount), "approve failed");
  }
}
```

---

## Quick client constants (TypeScript)

Use these to wire your front end / scripts. Adjust as you add networks.

```ts
export const AUTOMATION_ADDRESSES = {
  polygon: {
    automationLayer: "0x5fc876A1e9BB3f6c76990C4248b23F1B64E3c8dB",
    usdc:           "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // 6 decimals
  },
  optimism: {
    automationLayer: "0x1Bb81875e6133a4791a8FaB68aF6e455de9E1B04",
    usdc:           "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // 6 decimals
  },
  base: {
    automationLayer: "0x1Bb81875e6133a4791a8FaB68aF6e455de9E1B04",
    usdc:           "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // 6 decimals
  },
  arbitrum: {
    automationLayer: "0x1Bb81875e6133a4791a8FaB68aF6e455de9E1B04",
    usdc:           "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // 6 decimals
  },
} as const;
```

---

## Allowance & balance checklist (USDC)

- **USDC uses 6 decimals.** When approving or transferring, multiply user amounts by `1e6`.
- **Infinite approval** (MaxUint256) is common for low-maintenance automation.
- Some ERC-20s require setting allowance to `0` before increasing; USDC is one of them in many environments—follow the token’s recommendation.

**Ethers v6 snippet**
```ts
import { ethers } from "ethers";

const automation = "AUTOMATION_LAYER_ADDRESS";
const usdc       = "USDC_TOKEN_ADDRESS";
const erc20 = new ethers.Contract(usdc, [
  "function approve(address spender, uint256 value) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
], signer);

// Approve Max
await erc20.approve(automation, ethers.MaxUint256);

// Check allowance
const a = await erc20.allowance(await signer.getAddress(), automation);
console.log("Allowance:", a.toString());
```

---

## Notes

- Builders **do not** need the Sequencer address; it’s managed internally by the protocol.
- The **internal accountNumber** used by nodes is separate from your `id`. Your contract receives the same `id` back in both `checkSimpleAutomation(id)` and `simpleAutomation(id)`.

---

## See also

- **[Automation Overview](./automation-overview.md)** — Big picture, fee model, use cases  
- **[Core Functions](./automation-core.md)** — Exact signatures, approvals, examples  
- **[Events](./automation-events.md)** — Emitted events and how to consume them
