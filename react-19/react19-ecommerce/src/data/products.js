// src/data/products.js
export const mockProducts = [
  {
    id: '1',
    name: 'Wireless Noise-Canceling Headphones',
    price: 199.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    description: 'High-fidelity audio with active noise cancellation and 30-hour battery life.'
  },
  {
    id: '2',
    name: 'Ergonomic Mechanical Keyboard',
    price: 129.50,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
    description: 'Tactile mechanical switches with customizable RGB backlighting.'
  },
  {
    id: '3',
    name: 'Minimalist Smart Watch',
    price: 249.00,
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    description: 'Track health metrics, notifications, and exercise routines seamlessly.'
  }
];

// Promise creation for use() API
export function fetchProducts() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(mockProducts);
    }, 1500);
  });
}

export const productsPromise = fetchProducts();