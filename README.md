# Better Convex Query

TanStack Query-inspired React hooks for Convex with enhanced developer experience. Leverages Convex's built-in real-time sync engine - no additional caching needed!

## 🎯 Why Better Convex Query?

Convex already handles all the complex stuff (caching, retry logic, real-time subscriptions), but the basic `useQuery` hook lacks the developer experience of TanStack Query. This library provides:

- ✅ **Full TanStack Query-style status system** - `status: 'loading' | 'error' | 'success'`
- ✅ **Enhanced loading states** - `isLoading` vs `isFetching` distinction
- ✅ **Mutation callbacks** - `onSuccess`, `onError`, `onSettled`
- ✅ **Advanced TypeScript inference** - Perfect type safety
- ✅ **Zero additional complexity** - Convex handles the hard stuff!

## 🚀 Installation

```bash
npm install better-convex-query
# or
bun add better-convex-query
```

## 📖 Usage

### useQuery - TanStack Query Style

```tsx
import { useQuery } from 'better-convex-query';
import { api } from '../convex/_generated/api';

function UserProfile({ userId }: { userId: string }) {
  const { 
    data, 
    error, 
    status, 
    isLoading, 
    isFetching, 
    isPending, 
    isSuccess, 
    isError, 
    refetch 
  } = useQuery(
    api.users.getUser,
    { userId },
    { enabled: !!userId }
  );

  // Status-based rendering with TanStack-style API
  if (isLoading) return <div>🔄 Initial loading...</div>;
  if (isFetching) return <div>⚡ Fetching data...</div>;
  if (isError) return <div>❌ Error: {error?.message}</div>;
  if (!isSuccess || !data) return <div>❓ No data</div>;

  return (
    <div>
      <h1>Status: {status}</h1>
      <h2>{data.name}</h2>
      <p>{data.email}</p>
      <button onClick={refetch}>🔄 Refetch</button>
    </div>
  );
}
```

### useMutation - Enhanced with Callbacks

```tsx
import { useMutation } from 'better-convex-query';
import { api } from '../convex/_generated/api';

function UpdateUserForm({ userId }: { userId: string }) {
  const updateUser = useMutation(
    api.users.updateUser,
    {
      onSuccess: (data, variables) => {
        console.log('✅ User updated!', data);
        // Show success message, navigate, etc.
      },
      onError: (error, variables) => {
        console.error('❌ Update failed:', error);
        // Show error message to user
      },
      onSettled: (data, error, variables) => {
        console.log('📝 Update completed');
        // Cleanup, analytics, etc.
      }
    }
  );

  const handleSubmit = async (name: string) => {
    try {
      await updateUser.mutate({ userId, name });
    } catch (error) {
      // Error already handled in onError callback
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(e.target.name.value);
    }}>
      <input name="name" type="text" disabled={updateUser.isPending} />
      <button type="submit" disabled={updateUser.isPending}>
        {updateUser.isPending ? '💾 Saving...' : '💾 Save'}
      </button>
      {updateUser.error && <span>❌ {updateUser.error.message}</span>}
      <div>Status: {updateUser.status}</div>
    </form>
  );
}
```

## 📊 API Reference

### useQuery

```typescript
function useQuery<TQuery extends FunctionReference<'query'>>(
  query: TQuery,
  args: TArgs extends Record<string, never> ? 'skip' | undefined : TArgs,
  options?: UseQueryOptions
): UseQueryResult<FunctionReturnType<TQuery>>
```

#### Options
- `enabled?: boolean` - Whether to fetch data (default: `true`)

#### Return
- `data: TData | undefined` - The query result data
- `error: Error | undefined` - Any error that occurred
- `status: 'loading' | 'error' | 'success'` - TanStack-style status
- `isLoading: boolean` - Initial load only
- `isFetching: boolean` - Any load (including background refetches)
- `isPending: boolean` - Loading or error state
- `isSuccess: boolean` - Has successful data
- `isError: boolean` - Has error
- `refetch: () => void` - Manual refetch (Convex handles automatic refetching)

### useMutation

```typescript
function useMutation<TMutation extends FunctionReference<'mutation'>>(
  mutation: TMutation,
  options?: UseMutationOptions
): UseMutationResult<FunctionReturnType<TMutation>, Error, FunctionArgs<TMutation>>
```

#### Options
- `onSuccess?: (data, variables) => void` - Called on successful mutation
- `onError?: (error, variables) => void` - Called on mutation error
- `onSettled?: (data, error, variables) => void` - Called when mutation completes

#### Return
- `mutate: (variables) => Promise<TData>` - Trigger the mutation
- `mutateAsync: (variables) => Promise<TData>` - Same as mutate (alias)
- `isPending: boolean` - Whether mutation is running
- `error: Error | undefined` - Any error from last mutation
- `status: 'idle' | 'pending' | 'error' | 'success'` - Mutation status
- `reset: () => void` - Reset error and status

## 🎯 Key Features

### ✅ TanStack Query-Style Status System
```typescript
const { status, isLoading, isFetching, isSuccess, isError } = useQuery(query, args);
// status: 'loading' | 'error' | 'success'
```

### ✅ Loading State Distinction
```typescript
const { isLoading, isFetching } = useQuery(query, args);
// isLoading = initial load only
// isFetching = any load (initial + background refetch)
```

### ✅ Enhanced Mutation Callbacks
```typescript
const { mutate } = useMutation(mutation, {
  onSuccess: (data, variables) => { /* handle success */ },
  onError: (error, variables) => { /* handle error */ },
  onSettled: (data, error, variables) => { /* cleanup */ }
});
```

### ✅ Perfect TypeScript Inference
```typescript
// Types are automatically inferred from your Convex functions
const { data } = useQuery(api.users.getUser, { userId: '123' });
// data is automatically typed as the return type of api.users.getUser
```

### ✅ Convex Compatibility
```typescript
// Original Convex hooks still available
import { useConvexQuery, useConvexMutation } from 'better-convex-query';
```

## 🔧 Development

```bash
# Install dependencies
bun install

# Build the library
bun run build

# Watch mode for development
bun run dev

# Run tests
bun test
```

## 🧪 Testing

The library includes comprehensive tests. Run with:
```bash
bun test
```

## 📦 Bundle Size

Since bundle size doesn't matter for this library, we prioritize:
- ✅ Perfect TypeScript inference
- ✅ Comprehensive error handling
- ✅ Full feature parity with TanStack Query patterns
- ✅ Zero runtime overhead (just wrappers around Convex)

## 🚀 Why This Approach?

**Convex already provides:**
- ✅ Real-time subscriptions
- ✅ Automatic caching
- ✅ Retry logic
- ✅ Optimistic updates
- ✅ Connection management

**We add:**
- ✅ Better developer experience (TanStack-style API)
- ✅ Enhanced loading states
- ✅ Mutation callbacks
- ✅ Perfect TypeScript support

**We don't add:**
- ❌ Additional caching (Convex handles this)
- ❌ Retry logic (Convex handles this)
- ❌ Complex state management (Convex handles this)
- ❌ Bundle bloat (just thin wrappers)

## 📄 License

MIT
