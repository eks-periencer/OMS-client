# OMS Client

This client consumes the OMS main server APIs (and indirectly the onboarding service through the main server).

## Configure API base URL

Create a `.env` file at the project root (alongside `package.json`):

```
VITE_API_BASE_URL=https://oms-server-ntlv.onrender.com
```

If omitted, it defaults to `http://localhost:3003`.

## Quick start

```
npm i
npm run dev
```

## Client SDK

- `lib/api/client.ts`: axios instance and helpers
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
