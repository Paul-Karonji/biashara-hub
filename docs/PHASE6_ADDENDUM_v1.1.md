# Phase 6 Addendum v1.1 — M-Pesa Till Support + Unprompted (C2B) Payments

This document summarizes the specifications and implementations for the **Phase 6 Addendum v1.1**, which introduces M-Pesa Till (Buy Goods) online prompts, unprompted (C2B) manual payments, and Paystack card redirect checkouts.

## 1. Configurable Transaction Type

Instead of hardcoding standard Lipa Na M-Pesa STK prompts as `CustomerPayBillOnline` (which assumes a PayBill setup), the transaction type is now read from the environment variable:

```env
MPESA_TRANSACTION_TYPE=CustomerPayBillOnline # or CustomerBuyGoodsOnline
```

For sandbox testing credentials (Shortcode `174379`), `CustomerPayBillOnline` is the standard. If switched to `CustomerBuyGoodsOnline` for a Till number:
- `PartyB` in the STK request is configured to match the Till number.
- For Till transactions, the customer receipt does not surface an `AccountReference` the way PayBill does. Therefore, reconciliation relies on matching the Safaricom `TransID` (M-Pesa confirmation code).

## 2. Unprompted C2B Payments & Webhook Confirmation

An independent C2B module has been implemented to handle manual customer payments where a prompt is not pushed automatically.

### Webhook URLs
- **Validation**: `/hooks/c2b/validation`
- **Confirmation**: `/hooks/c2b/confirmation`

These webhooks are registered with Safaricom using a manual POST to `/admin/mpesa/c2b-register` (or via script). Note: Safaricom rejects C2B webhook URLs containing the word `MPESA`, so they are hosted under `/hooks/c2b` instead of `/hooks/mpesa/c2b`.

### Order Matching Logic
- **PayBill Flow**: Match by `BillRefNumber` against the order's `display_id` or `cart_id`.
- **Till Flow**: Since Till transactions do not contain a customer-specified reference, they are logged in the database (`mpesa_c2b_payment` model) as `status: 'unmatched'`. They are manually reconciled when the customer inputs their transaction code.

## 3. Phone Number Normalization

Kenyan phone number validation has been made prefix-agnostic. Both `07xx...`, `01xx...` (new blocks), and `+254...` format numbers are accepted.
- Normalization strips non-digits (excluding leading `+`), and prefix `0` is replaced with country code `254`.
- Input validation pattern: `/^(0\d{9}|\+254\d{9})$/`

## 4. Storefront Verification UI

To support manual Till payments, the storefront checkout allows toggling between **STK Push Prompt** and **Manual Till Payment**.

1. **Manual Till Payment Instruction**: Shows instructions to pay KES X to Till Number `174379`.
2. **"I've already paid" Flow**: A text field allows customers to enter their 10-character confirmation code. Clicking "Verify Code" queries `/store/mpesa/c2b-verify` to find the recorded C2B transaction and automatically authorizes the checkout cart.
3. **Verification Page**: A dedicated page is available at `/order/[id]/c2b-verify` where customers can enter their transaction code *after* completing checkout if they chose to pay later.
