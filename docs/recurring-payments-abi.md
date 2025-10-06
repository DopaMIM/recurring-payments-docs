---
id: recurring-payments-abi
title: Recurring Payments ABI
sidebar_label: Recurring Payments ABI
sidebar_position: 31
description: Gateway-only ABI for the original RecurringPayments contract. Excludes owner/admin and automation-layer-only methods.
---


## ABI 
```json
[
  {
    "type": "event",
    "name": "RecurringPaymentCreated",
    "inputs": [
      { "name": "accountNumber", "type": "uint256", "indexed": false },
      { "name": "sender", "type": "address", "indexed": true },
      { "name": "recipient", "type": "address", "indexed": true },
      { "name": "amount", "type": "uint256", "indexed": false },
      { "name": "token", "type": "address", "indexed": false },
      { "name": "timeIntervalSeconds", "type": "uint256", "indexed": false },
      { "name": "paymentInterface", "type": "address", "indexed": true },
      { "name": "additionalInformation", "type": "string[]", "indexed": false },
      { "name": "paymentDue", "type": "uint256", "indexed": false },
      { "name": "canceled", "type": "bool", "indexed": false }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RecurringPaymentCancelled",
    "inputs": [
      { "name": "index", "type": "uint256", "indexed": true },
      { "name": "sender", "type": "address", "indexed": true },
      { "name": "recipient", "type": "address", "indexed": true }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PaymentTransferred",
    "inputs": [
      { "name": "index", "type": "uint256", "indexed": true }
    ],
    "anonymous": false
  },

  {
    "type": "function",
    "name": "createRecurringPayment",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "_recipient", "type": "address" },
      { "name": "_amount", "type": "uint256" },
      { "name": "_token", "type": "address" },
      { "name": "_timeIntervalSeconds", "type": "uint256" },
      { "name": "_interface", "type": "address" },
      { "name": "_additionalInformation", "type": "string[]" },
      { "name": "_freeTrialTimeInSeconds", "type": "uint256" }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "cancelRecurringPayment",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "accountNumber", "type": "uint256" }],
    "outputs": []
  },

  {
    "type": "function",
    "name": "getAccountNumbersByAddress",
    "stateMutability": "view",
    "inputs": [{ "name": "accountAddress", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256[]" }]
  },
  {
    "type": "function",
    "name": "getPaymentDue",
    "stateMutability": "view",
    "inputs": [{ "name": "accountNumber", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "isSubscriptionValid",
    "stateMutability": "view",
    "inputs": [{ "name": "accountNumber", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "bool" }]
  },
  {
    "type": "function",
    "name": "isPaymentCanceled",
    "stateMutability": "view",
    "inputs": [{ "name": "accountNumber", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "bool" }]
  },
  {
    "type": "function",
    "name": "getAdditionalInformation",
    "stateMutability": "view",
    "inputs": [{ "name": "accountNumber", "type": "uint256" }],
    "outputs": [{ "name": "", "type": "string[]" }]
  },
  {
    "type": "function",
    "name": "getCancelledAccounts",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256[]" }]
  }
]
