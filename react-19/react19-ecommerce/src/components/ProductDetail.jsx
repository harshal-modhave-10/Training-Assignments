// src/components/ProductDetail.jsx
import { useOptimistic, useState, useTransition } from 'react';

export function ProductDetail({ product, cart, setCart }) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState(null);

  // React 19 useOptimistic hook
  const [optimisticCart, setOptimisticCart] = useOptimistic(
    cart,
    (currentCart, newCount) => currentCart + newCount
  );

  // Simulated server call that fails randomly to test rollback
  async function simulateAddToCartAPI() {
    await new Promise((res) => setTimeout(res, 1200));
    // Simulate 30% chance of server failure
    if (Math.random() < 0.3) {
      throw new Error('Server error: Failed to update cart.');
    }
    return true;
  }

  const handleAddToCart = () => {
    setErrorMessage(null);
    startTransition(async () => {
      // 1. Optimistically update UI count immediately
      setOptimisticCart(1);

      try {
        // 2. Perform async API call
        await simulateAddToCartAPI();
        // 3. On success, update permanent React state
        setCart((prev) => prev + 1);
      } catch (err) {
        // 4. On failure, revert error message (optimistic state automatically rolls back)
        setErrorMessage(err.message);
      }
    });
  };

  // React 19 Callback Ref with Cleanup Function
  const measureElementRef = (node) => {
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      console.log('Product Card Resized:', entry.contentRect);
    });

    observer.observe(node);

    // React 19 Cleanup function returned directly from ref callback
    return () => {
      observer.disconnect();
      console.log('ResizeObserver cleanup executed.');
    };
  };

  return (
    <div ref={measureElementRef} style={{ border: '2px solid #0070f3', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
      <h2>Product Details</h2>
      <img src={product.image} alt={product.name} style={{ width: '200px', height: '200px', objectFit: 'cover' }} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p><strong>Price:</strong> ${product.price}</p>

      <div style={{ margin: '15px 0' }}>
        <strong>Cart Count: </strong> 
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: isPending ? 'orange' : 'black' }}>
          {optimisticCart} {isPending && '(Updating...)'}
        </span>
      </div>

      <button 
        onClick={handleAddToCart}
        disabled={isPending}
        style={{ padding: '10px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Add to Cart
      </button>

      {errorMessage && (
        <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>
      )}
    </div>
  );
}