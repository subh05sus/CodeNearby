# Testing Guide

## Levels
- Unit tests for pure utilities
- Integration tests for API routes (token checks, auth, happy paths)
- Component tests for critical UI flows (API Dashboard, Token Store)

## Suggested Tools
- Jest + React Testing Library for UI
- Next.js Route Handlers tested with Node test runner or Jest + supertest

## Sample Areas
- Token reset logic (daily reset)
- API key validation and permission gates
- Razorpay verification (mock signature)

## Running Tests
Project currently has limited tests under `test/`. Expand incrementally with each feature.
