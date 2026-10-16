# React 19 Mini E-Commerce Application

## Features & React 19 Concepts Implemented

### Task 1 Implementation
1. **`use()` API**: Used inside `<ProductList />` to unwrapp promises directly inside components without requiring standard `useEffect` or `useState` data-fetching boilerplate.
2. **`<Suspense>`**: Wraps `<ProductList />` to provide a declarative loading fallback while `productsPromise` is resolving.
3. **`useActionState()`**: Handles registration form submission state asynchronously, returning status (success/error/validation) directly from actions.
4. **`useFormStatus()`**: Extracted into `<SubmitButton />` to detect pending action states and automatically disable the submit button during network requests.
5. **React 19 Context Syntax**: `<UserContext value={...}>` is used in place of the deprecated `<UserContext.Provider value={...}>`.
6. **Asset Loading APIs**:
   - `preconnect('https://images.unsplash.com')`: Pre-establishes network connection to the external image host CDN to lower latency.
   - `preload(...)`: Preloads external stylesheets/fonts required for app styling.
7. **Document Metadata**: Direct rendering of `<title>` and `<meta name="description">` inside `<ProductList />` without external libraries like `react-helmet`.

### Task 2 Implementation
1. **`useOptimistic()`**: Instantly increments local cart count when clicking "Add to Cart". If simulated network requests fail, the hook automatically rolls back to the persistent cart state.
2. **Ref as a Prop**: The `<SearchInput />` component receives `ref` as a standard prop directly, bypassing `forwardRef()`.
3. **Ref Cleanups**: `<ProductDetail />` attaches a `ResizeObserver` via a callback ref and returns a cleanup function executed automatically when the component unmounts.
4. **Server vs Client Components Explanation**:
   - **Product Details as Server Component**: Product details consist mostly of static text/images. Rendered on the server, it reduces bundle size and eliminates client JavaScript cost.
   - **Add to Cart as Client Component**: Requires interactive state (`useOptimistic`, event listeners, click handlers).
   - **Cooperation**: Server Components render overall layouts and fetch initial data, seamlessly wrapping Client Components for interactive islands.
5. **React Compiler Explanation**:
   - **Role**: Automatically memoizes component trees and values without needing explicit `useMemo` or `useCallback`.
   - **Optimization Example**: In `<ProductList />`, list item rendering and layout calculations are auto-memoized, preventing re-renders when parent state updates.