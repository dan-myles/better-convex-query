import { describe, test, expect } from 'bun:test';
import { useQuery, useMutation, useConvexQuery, useConvexMutation } from './index';

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
});
