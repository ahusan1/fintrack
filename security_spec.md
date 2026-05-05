# Security Specification: SpendWise Expense Tracker

## Data Invariants
- A transaction must belong to a valid user.
- Users can only read/write their own transactions.
- Transactions must have a valid type (income/expense) and category.
- Timestamps (`createdAt`, `updatedAt`) must be server-generated.

## The "Dirty Dozen" Payloads (PERMISSION_DENIED expected)

1. **Identity Spoofing**: Attempting to create a profile for another UID.
   ```json
   { "email": "victim@example.com", "uid": "victim_uid" } // Sent as request.auth.uid = attacker_uid
   ```
2. **Resource Poisoning**: Document ID with malicious characters.
   ```path
   /users/user123/transactions/../../etc/passwd
   ```
3. **State Corruption**: Setting a future/past `createdAt` manually.
   ```json
   { "amount": 100, "type": "expense", "category": "Food", "date": "2026-05-03", "createdAt": "2020-01-01T00:00:00Z" }
   ```
4. **Shadow Update**: Adding unvalidated fields.
   ```json
   { "amount": 100, "type": "expense", "category": "Food", "date": "2026-05-03", "isVerified": true }
   ```
5. **Cross-User Leak**: Authenticated user trying to list another user's transactions.
   ```path
   /users/victim_uid/transactions
   ```
6. **Type Poisoning**: Sending `amount` as a string.
   ```json
   { "amount": "1000", "type": "expense", "category": "Food", "date": "2026-05-03" }
   ```
7. **Invalid Enum**: Sending an unsupported transaction type.
   ```json
   { "amount": 100, "type": "luxury", "category": "Food", "date": "2026-05-03" }
   ```
8. **Note Overflow**: Extremely long note (50KB).
   ```json
   { "amount": 100, "type": "expense", "category": "Food", "date": "2026-05-03", "note": "a... (x50000)" }
   ```
9. **ID Injection**: Using a long ID to hit quota/storage limits.
   ```path
   /users/user123/transactions/very_long_id_exceeding_128_chars...
   ```
10. **Immutable Field Change**: Trying to change `createdAt` on update.
    ```json
    { "amount": 200, "createdAt": "2026-01-01T00:00:00Z" } // Update attempt
    ```
11. **Email Spoofing**: Creating a user without being signed in.
    ```path
    /users/attacker_uid (request.auth = null)
    ```
12. **Bypass Validation**: Sending a payload missing required fields.
    ```json
    { "amount": 100 } // Missing type, category, date
    ```

## Test Runner
Wait for implementation of `firestore.rules.test.ts` if needed, but the rules are designed to block these.
