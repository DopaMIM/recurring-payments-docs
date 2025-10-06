---
id: automation-abi
title: Automation Layer ABI
sidebar_label: Automation Layer ABI
sidebar_position: 32
description: Builder-facing ABI for the AutomationLayer contract—only what integrators need to register, check, and cancel automated jobs.
---

## ABI

```json
[
  {
    "type": "event",
    "name": "AccountCreated",
    "inputs": [
      { "name": "customer", "type": "address", "indexed": true }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "AccountCancelled",
    "inputs": [
      { "name": "index", "type": "uint256", "indexed": true },
      { "name": "account", "type": "address", "indexed": true }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TransactionSuccess",
    "inputs": [
      { "name": "index", "type": "uint256", "indexed": true }
    ],
    "anonymous": false
  },

  {
    "type": "function",
    "name": "createAccount",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "id", "type": "uint256" }],
    "outputs": []
  },
  {
    "type": "function",
    "name": "cancelAccount",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "id", "type": "uint256" }],
    "outputs": []
  },
  {
    "type": "function",
    "name": "checkSimpleAutomation",
    "stateMutability": "view",
    "inputs": [{ "name": "accountNumber", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "bool" }]
  },
  {
    "type": "function",
    "name": "getAccountsByAddress",
    "stateMutability": "view",
    "inputs": [{ "name": "accountAddress", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256[]" }]
  },
  {
    "type": "function",
    "name": "isAccountCanceled",
    "stateMutability": "view",
    "inputs": [{ "name": "accountNumber", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "bool" }]
  },
  {
    "type": "function",
    "name": "accountsByNumber",
    "stateMutability": "view",
    "inputs": [{ "name": "", "type": "uint256" }],
    "outputs": [
      { "name": "account", "type": "address" },
      { "name": "id", "type": "uint256" },
      { "name": "accountCreationFee", "type": "uint256" },
      { "name": "cancelled", "type": "bool" }
    ]
  },
  {
    "type": "function",
    "name": "getCancelledAccounts",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256[]" }]
  }
]
