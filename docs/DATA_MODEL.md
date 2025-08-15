# Data Model

This document outlines the primary collections and notable fields.

## users
- _id
- name, email, image, githubId
- tier (free|premium), verification
- tokens: { balance, lastResetAt }
- createdAt, updatedAt

## api_keys
- _id
- userId
- name
- hash (sha-256)
- createdAt, lastUsed

## pending_orders
- orderId
- userId
- packageId, currency, amount
- status (pending|expired|processed)
- expiresAt, createdAt

## transactions
- userId
- orderId, paymentId
- packageId, tokensAdded
- amount, currency
- createdAt

## webhook_logs
- event
- payload (subset)
- createdAt

Note: Some fields are inferred from implementation docs and may vary slightly in code.
