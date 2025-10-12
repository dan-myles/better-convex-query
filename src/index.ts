import {
  useQueries,
  useMutation as useConvexMutation,
} from "convex/react";
import { useQueries as useCachedQueries } from "convex-helpers/react/cache/hooks";
import type {
  FunctionReference,
  FunctionArgs,
  FunctionReturnType,
} from "convex/server";
import { getFunctionName } from "convex/server";
import { convexToJson } from "convex/values";
import { useCallback, useMemo, useState } from "react";
export { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
export type { ConvexQueryCacheOptions } from "convex-helpers/react/cache/provider";

// TanStack Query-style status types
export type QueryStatus = "loading" | "error" | "success";
export type MutationStatus = "idle" | "pending" | "error" | "success";

// Enhanced TypeScript inference for better DX
export type InferQueryArgs<T> =
  T extends FunctionReference<"query"> ? FunctionArgs<T> : never;
export type InferQueryData<T> =
  T extends FunctionReference<"query"> ? FunctionReturnType<T> : never;
export type InferMutationArgs<T> =
  T extends FunctionReference<"mutation"> ? FunctionArgs<T> : never;
export type InferMutationData<T> =
  T extends FunctionReference<"mutation"> ? FunctionReturnType<T> : never;

export interface UseQueryOptions {
  enabled?: boolean;
}

export interface UseQueryResult<TData = unknown, TError = Error> {
  data: TData | undefined;
  error: TError | undefined;
  status: QueryStatus;
  isLoading: boolean;
  isFetching: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  refetch: () => void;
}

export interface UseMutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = unknown,
> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  onSettled?: (
    data: TData | undefined,
    error: TError | undefined,
    variables: TVariables,
  ) => void;
}

export interface UseMutationResult<
  TData = unknown,
  TError = Error,
  TVariables = unknown,
> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isPending: boolean;
  error: TError | undefined;
  status: MutationStatus;
  reset: () => void;
}

type OptionalRestArgsOrSkip<FuncRef extends FunctionReference<any>> =
  FuncRef["_args"] extends Record<string, never>
    ? [args?: Record<string, never> | "skip", options?: UseQueryOptions]
    : [args: FuncRef["_args"] | "skip", options?: UseQueryOptions];

/**
 * TanStack Query-style hook for Convex queries with enhanced status and loading states.
 * Leverages Convex's built-in real-time sync engine - no additional caching needed!
 *
 * @example
 * ```tsx
 * const { data, error, status, isLoading, isFetching, refetch } = useQuery(
 *   api.users.getUser,
 *   { userId: '123' },
 *   { enabled: !!userId }
 * );
 * ```
 */
export function useQuery<TQuery extends FunctionReference<"query">>(
  query: TQuery,
  ...queryArgs: OptionalRestArgsOrSkip<TQuery>
): UseQueryResult<FunctionReturnType<TQuery>> {
  // Extract args and options from the rest parameters
  const args = queryArgs[0] ?? ({} as FunctionArgs<TQuery>);
  const options = queryArgs[1];

  const { enabled = true } = options ?? {};

  // Follow the same pattern as native Convex useQuery
  const skip = args === "skip";
  const argsObject = args === "skip" ? {} : args;

  const queries = useMemo(() => {
    if (skip || !enabled) {
      return {};
    }
    return { query: { query, args: argsObject } };
  }, [
    JSON.stringify(convexToJson(argsObject)),
    getFunctionName(query),
    skip,
    enabled,
  ]);

  const results = useQueries(queries);
  const convexResult = results.query;

  // Manual refetch function
  const refetch = useCallback(() => {
    // Convex handles refetching automatically when dependencies change
    // This is mainly for API compatibility with TanStack
    console.warn(
      "refetch() is called - Convex handles refetching automatically through its reactive system",
    );
  }, []);

  // Handle errors like native Convex implementation
  if (convexResult instanceof Error) {
    return {
      data: undefined,
      error: convexResult,
      status: "error",
      isLoading: false,
      isFetching: false,
      isPending: false,
      isSuccess: false,
      isError: true,
      refetch,
    } as UseQueryResult<FunctionReturnType<TQuery>>;
  }

  // If disabled or skipped, return pending state
  if (!enabled || skip) {
    return {
      data: undefined,
      error: undefined,
      status: "loading",
      isLoading: false,
      isFetching: false,
      isPending: true,
      isSuccess: false,
      isError: false,
      refetch,
    } as UseQueryResult<FunctionReturnType<TQuery>>;
  }

  // If data is still loading
  if (convexResult === undefined) {
    return {
      data: undefined,
      error: undefined,
      status: "loading",
      isLoading: true,
      isFetching: true,
      isPending: true,
      isSuccess: false,
      isError: false,
      refetch,
    } as UseQueryResult<FunctionReturnType<TQuery>>;
  }

  // Data loaded successfully
  return {
    data: convexResult,
    error: undefined,
    status: "success",
    isLoading: false,
    isFetching: false,
    isPending: false,
    isSuccess: true,
    isError: false,
    refetch,
  } as UseQueryResult<FunctionReturnType<TQuery>>;
}

/**
 * TanStack Query-style hook for Convex mutations with enhanced callbacks and status.
 * Leverages Convex's built-in mutation handling - no additional complexity needed!
 *
 * @example
 * ```tsx
 * const { mutate, isPending, status, error } = useMutation(
 *   api.users.updateUser,
 *   {
 *     onSuccess: (data, variables) => {
 *       console.log('User updated!', data);
 *     },
 *     onError: (error, variables) => {
 *       console.error('Update failed:', error);
 *     }
 *   }
 * );
 * ```
 */
export function useMutation<
  TMutation extends FunctionReference<"mutation">,
  TArgs extends FunctionArgs<TMutation> = FunctionArgs<TMutation>,
  TData extends FunctionReturnType<TMutation> = FunctionReturnType<TMutation>,
>(
  mutation: TMutation,
  options?: UseMutationOptions<TData, Error, TArgs>,
): UseMutationResult<TData, Error, TArgs> {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [status, setStatus] = useState<MutationStatus>("idle");

  const convexMutation = useConvexMutation(mutation);

  const reset = useCallback(() => {
    setIsPending(false);
    setError(undefined);
    setStatus("idle");
  }, []);

  const mutateAsync = useCallback(
    async (variables: TArgs): Promise<TData> => {
      setIsPending(true);
      setError(undefined);
      setStatus("pending");

      try {
        const result = await convexMutation(variables);

        // Call success callback
        if (options?.onSuccess) {
          options.onSuccess(result, variables);
        }

        // Call settled callback
        if (options?.onSettled) {
          options.onSettled(result, undefined, variables);
        }

        setStatus("success");
        setIsPending(false);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");

        setError(error);
        setStatus("error");
        setIsPending(false);

        // Call error callback
        if (options?.onError) {
          options.onError(error, variables);
        }

        // Call settled callback
        if (options?.onSettled) {
          options.onSettled(undefined, error, variables);
        }

        throw error;
      }
    },
    [convexMutation, options],
  );

  const mutate = useCallback(
    (variables: TArgs): Promise<TData> => {
      return mutateAsync(variables);
    },
    [mutateAsync],
  );

  return {
    mutate,
    mutateAsync,
    isPending,
    error,
    status,
    reset,
  } as UseMutationResult<TData, Error, TArgs>;
}

/**
 * TanStack Query-style hook for Convex queries with enhanced status and loading states,
 * using the Convex query cache to keep subscriptions alive longer.
 * 
 * This hook requires wrapping your app with ConvexQueryCacheProvider:
 * ```tsx
 * <ConvexProvider client={convex}>
 *   <ConvexQueryCacheProvider>
 *     <App />
 *   </ConvexQueryCacheProvider>
 * </ConvexProvider>
 * ```
 *
 * @example
 * ```tsx
 * const { data, error, status, isLoading, isFetching, refetch } = useCacheQuery(
 *   api.users.getUser,
 *   { userId: '123' },
 *   { enabled: !!userId }
 * );
 * ```
 */
export function useCacheQuery<TQuery extends FunctionReference<"query">>(
  query: TQuery,
  ...queryArgs: OptionalRestArgsOrSkip<TQuery>
): UseQueryResult<FunctionReturnType<TQuery>> {
  const args = queryArgs[0] ?? ({} as FunctionArgs<TQuery>);
  const options = queryArgs[1];

  const { enabled = true } = options ?? {};

  const skip = args === "skip";
  const argsObject = args === "skip" ? {} : args;

  const queries = useMemo(() => {
    if (skip || !enabled) {
      return {};
    }
    return { query: { query, args: argsObject } };
  }, [
    JSON.stringify(convexToJson(argsObject)),
    getFunctionName(query),
    skip,
    enabled,
  ]);

  const results = useCachedQueries(queries);
  const convexResult = results.query;

  const refetch = useCallback(() => {
    console.warn(
      "refetch() is called - Convex handles refetching automatically through its reactive system",
    );
  }, []);

  if (convexResult instanceof Error) {
    return {
      data: undefined,
      error: convexResult,
      status: "error",
      isLoading: false,
      isFetching: false,
      isPending: false,
      isSuccess: false,
      isError: true,
      refetch,
    } as UseQueryResult<FunctionReturnType<TQuery>>;
  }

  if (!enabled || skip) {
    return {
      data: undefined,
      error: undefined,
      status: "loading",
      isLoading: false,
      isFetching: false,
      isPending: true,
      isSuccess: false,
      isError: false,
      refetch,
    } as UseQueryResult<FunctionReturnType<TQuery>>;
  }

  if (convexResult === undefined) {
    return {
      data: undefined,
      error: undefined,
      status: "loading",
      isLoading: true,
      isFetching: true,
      isPending: true,
      isSuccess: false,
      isError: false,
      refetch,
    } as UseQueryResult<FunctionReturnType<TQuery>>;
  }

  return {
    data: convexResult,
    error: undefined,
    status: "success",
    isLoading: false,
    isFetching: false,
    isPending: false,
    isSuccess: true,
    isError: false,
    refetch,
  } as UseQueryResult<FunctionReturnType<TQuery>>;
}

// Re-export Convex's original hooks for compatibility
export {
  useQuery as useConvexQuery,
  useMutation as useConvexMutation,
} from "convex/react";

// Re-export Convex types for convenience
export type {
  FunctionReference,
  FunctionArgs,
  FunctionReturnType,
} from "convex/server";
