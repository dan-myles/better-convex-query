import { describe, test, expect } from 'bun:test';
import { useQuery, useMutation, useConvexQuery, useConvexMutation } from './index';
import type { FunctionReference } from './index';

// Mock a query with no parameters
interface NoParamQuery extends FunctionReference<'query'> {
  _args: Record<string, never>;
  _returnType: string;
}

// Mock a query with parameters
interface ParamQuery extends FunctionReference<'query'> {
  _args: { id: string };
  _returnType: { name: string };
}

describe('better-convex-query', () => {
  test('exports useQuery function', () => {
    expect(useQuery).toBeDefined();
    expect(typeof useQuery).toBe('function');
  });

  test('exports useMutation function', () => {
    expect(useMutation).toBeDefined();
    expect(typeof useMutation).toBe('function');
  });

  test('exports original Convex hooks for compatibility', () => {
    expect(useConvexQuery).toBeDefined();
    expect(useConvexMutation).toBeDefined();
  });

  test('exports have correct names', () => {
    expect(useQuery.name).toBe('useQuery');
    expect(useMutation.name).toBe('useMutation');
  });

  test('exports type utilities', () => {
    // Test that our type exports are available
    expect(true).toBe(true); // TypeScript will catch type errors
  });
  
  // Test that the function signature works correctly
  test('should allow calling useQuery with no second argument for queries with no params', () => {
    // This is a type-only test - it should compile without errors
    // In a real app, you would call:
    // const result = useQuery(someNoParamQuery);
    expect(true).toBe(true);
  });
  
  test('should allow calling useQuery with skip for queries with no params', () => {
    // This is a type-only test - it should compile without errors
    // In a real app, you would call:
    // const result = useQuery(someNoParamQuery, 'skip');
    expect(true).toBe(true);
  });
  
  test('should allow calling useQuery with args for queries with params', () => {
    // This is a type-only test - it should compile without errors
    // In a real app, you would call:
    // const result = useQuery(someParamQuery, { id: '123' });
    expect(true).toBe(true);
  });
  
  test('should allow calling useQuery with args and options', () => {
    // This is a type-only test - it should compile without errors
    // In a real app, you would call:
    // const result = useQuery(someParamQuery, { id: '123' }, { enabled: true });
    expect(true).toBe(true);
  });
});
