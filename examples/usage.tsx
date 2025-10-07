import React from 'react';
import { useQuery, useMutation } from '../dist/index';
import type { FunctionReference } from '../dist/index';

// Example Convex query function type (this would come from your generated API)
interface GetUserQuery extends FunctionReference<'query'> {
  _args: { userId: string };
  _returnType: { 
    id: string;
    name: string; 
    email: string;
    createdAt: number;
  };
}

// Example Convex mutation function type
interface UpdateUserMutation extends FunctionReference<'mutation'> {
  _args: { userId: string; name: string };
  _returnType: { success: boolean; updatedUser: any };
}

// Example React component using the new TanStack-style API
function UserProfile({ userId }: { userId: string }) {
  // useQuery with full TanStack-style status and loading states
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
    {} as GetUserQuery, // This would be your actual Convex query function
    { userId },
    { enabled: !!userId }
  );

  // useMutation with callback system
  const updateUser = useMutation(
    {} as UpdateUserMutation, // This would be your actual Convex mutation function
    {
      onSuccess: (data, variables) => {
        console.log('✅ User updated successfully!', data);
        // Optionally trigger a refetch or show success message
      },
      onError: (error, variables) => {
        console.error('❌ Failed to update user:', error);
        // Show error message to user
      },
      onSettled: (data, error, variables) => {
        console.log('📝 Update mutation completed');
        // Cleanup, analytics, etc.
      }
    }
  );

  const handleUpdateName = async (newName: string) => {
    try {
      await updateUser.mutate({ userId, name: newName });
      console.log('Name update initiated');
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  // Loading states with TanStack-style API
  if (isLoading) {
    return <div>🔄 Initial loading...</div>;
  }

  if (isFetching) {
    return <div>⚡ Fetching data (including background refetch)...</div>;
  }

  if (isPending) {
    return <div>⏳ Pending (loading or error state)...</div>;
  }

  if (isError) {
    return <div>❌ Error: {error?.message}</div>;
  }

  if (!isSuccess || !data) {
    return <div>❓ No data available</div>;
  }

  // Status-based rendering with TanStack-style API
  return (
    <div>
      <h1>User Profile</h1>
      <div>Status: {status}</div>
      
      {isSuccess && (
        <>
          <h2>{data.name}</h2>
          <p>Email: {data.email}</p>
          <p>Created: {new Date(data.createdAt).toLocaleDateString()}</p>
          
          <button onClick={() => handleUpdateName('New Name')}>
            Update Name
          </button>
          
          {updateUser.isPending && <span>💾 Saving...</span>}
          {updateUser.status === 'error' && <span>❌ Error: {updateUser.error?.message}</span>}
          {updateUser.status === 'success' && <span>✅ Saved!</span>}
          
          <button onClick={() => refetch()}>
            🔄 Manual Refetch
          </button>
        </>
      )}
    </div>
  );
}

// Example with conditional fetching
function ConditionalUser({ userId }: { userId?: string }) {
  const { data, isLoading, isFetching, status } = useQuery(
    {} as GetUserQuery,
    userId ? { userId } : 'skip',
    { enabled: !!userId }
  );

  if (!userId) {
    return <div>👤 No user selected</div>;
  }

  if (isLoading) {
    return <div>🔄 Loading user...</div>;
  }

  return (
    <div>
      <h3>Selected User</h3>
      <p>Status: {status}</p>
      <p>Is Fetching: {isFetching ? 'Yes' : 'No'}</p>
      {data && <p>Name: {data.name}</p>}
    </div>
  );
}

// Example with mutation status tracking
function UpdateUserForm({ userId }: { userId: string }) {
  const [newName, setNewName] = useState('');
  
  const updateUser = useMutation({} as UpdateUserMutation, {
    onSuccess: (data, variables) => {
      console.log('✅ Success callback:', data);
      setNewName(''); // Clear form
    },
    onError: (error, variables) => {
      console.log('❌ Error callback:', error);
    },
    onSettled: (data, error, variables) => {
      console.log('📝 Settled callback - mutation completed');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      updateUser.mutate({ userId, name: newName.trim() });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="New name"
        disabled={updateUser.isPending}
      />
      <button type="submit" disabled={updateUser.isPending}>
        {updateUser.isPending ? '💾 Saving...' : '💾 Save'}
      </button>
      
      <div>
        <p>Mutation Status: {updateUser.status}</p>
        {updateUser.error && <p style={{ color: 'red' }}>❌ {updateUser.error.message}</p>}
      </div>
      
      {updateUser.status !== 'idle' && (
        <button type="button" onClick={updateUser.reset}>
          🔄 Reset
        </button>
      )}
    </form>
  );
}

export { UserProfile, ConditionalUser, UpdateUserForm };
