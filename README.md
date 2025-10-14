# OMS Client

This client is the web UI for the OMS backend. It primarily talks to the OMS server, and for payments it also calls the onboarding service directly on the payment success screen to confirm the Stripe Checkout Session.

## Environment configuration

Create a `.env` file at the project root (alongside `package.json`). These variables control where the app sends requests:

```bash
# OMS API base (required in hosted environments)
VITE_API_BASE_URL=https://<oms-host>

# Onboarding service base used by the Payment Success screen
# If omitted, the client will also look for window.__ONB_API_BASE_URL__ at runtime
# and falls back to https://microservices-oms.onrender.com for hosted dev
VITE_ONB_BASE_URL=https://<onboarding-host>
```

Alternate runtime global (if you cannot rebuild):

```html
<script>
  window.__ONB_API_BASE_URL__ = 'https://<onboarding-host>'
  // Example: window.__ONB_API_BASE_URL__ = 'https://onboarding.example.com'
</script>
```

Defaults if unset:
- `VITE_API_BASE_URL` → `https://oms-server-ntlv.onrender.com`
- `VITE_ONB_BASE_URL`/`window.__ONB_API_BASE_URL__` → `https://microservices-oms.onrender.com`

## Running locally

```bash
npm i
npm run dev
```

Ensure your local OMS and onboarding services are running and CORS allows `http://localhost:5173` (or your Vite dev port).

## Payment confirmation flow

After a successful Stripe Checkout payment, Stripe redirects to your success URL with `?session_id=cs_test_...`.

The page `pages/payment/success/page.tsx` automatically:
1. Reads `session_id` from the URL
2. Calls the onboarding public endpoint:
   - `POST /api/payments/confirm?session_id=<session_id>` on `VITE_ONB_BASE_URL`
3. On success, the onboarding service verifies the session with Stripe and notifies OMS to mark the order as paid (`is_paid=true`, `status=payment_received`).
4. The UI shows either “Payment confirmed and order updated.” or an error banner.

Note: The confirmation call is public; no user auth headers are required.

## Quick Postman checks

1) Confirm payment (onboarding):
```bash
POST {{onboarding_base}}/api/payments/confirm?session_id={{session_id}}
Content-Type: application/json
```

2) Verify order (OMS):
```bash
GET {{oms_base}}/orders/{{order_id}}
```
Expected: `isPaid` true and `status` `payment_received` after confirmation.

## Troubleshooting

- CORS error on confirm: allow the client origin on onboarding CORS config.
- Wrong base URL: set `VITE_ONB_BASE_URL` or `window.__ONB_API_BASE_URL__` to your onboarding host.
- Missing/invalid `session_id`: use the `session_id` from the Stripe success redirect or from Stripe Dashboard → Checkout Sessions.
- OMS not updated: ensure onboarding has `OMS_SERVER_URL` and matching `ONBOARDING_SERVICE_API_KEY` to reach OMS.

## Client SDK

- `lib/api/client.ts`: shared axios instance for OMS
- `lib/api/customers.ts`: typed functions for customer endpoints
- `hooks/useCustomers.ts`: React hook with load/create/convert helpers

### Example: list and create customers

```tsx
import { useCustomers } from '@/hooks/useCustomers';

export default function CustomersPage() {
  const { customers, loading, error, create } = useCustomers();

  const handleCreate = async () => {
    await create({
      firstName: 'Thandi',
      lastName: 'Nkosi',
      email: 'thandi.nkosi@company.co.za',
      customerType: 'business',
      isTrial: true,
      address: { street: '123 Rivonia Road', city: 'Johannesburg', state: 'Gauteng', postal_code: '2196', country: 'South Africa' }
    });
  };

  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div>
      <button onClick={handleCreate}>Create trial customer</button>
      <ul>
        {customers.map(c => (
          <li key={c.id}>{c.first_name} {c.last_name} — {c.email}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Auth

If your OMS server requires a bearer token, set it after login:

```ts
import { setAuthToken } from '@/lib/api/client';
setAuthToken('<JWT_TOKEN>');
```
