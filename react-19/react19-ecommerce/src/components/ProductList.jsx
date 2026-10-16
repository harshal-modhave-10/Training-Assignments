// src/components/ProductList.jsx
import { use } from 'react';
import { preload, preconnect } from 'react-dom';

export function ProductList({ productsPromise, onSelectProduct }) {
  // React 19 Asset Loading APIs
  // 1. preconnect: Establish early connection to CDN hosting product images
  preconnect('https://images.unsplash.com');
  
  // 2. preload: Preload main layout/stylesheet assets
  preload('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap', {
    as: 'style'
  });

  // React 19 use() API to consume the Promise
  const products = use(productsPromise);

  return (
    <div>
      {/* React 19 Native Document Metadata */}
      <title>Mini E-Commerce Store - Products</title>
      <meta name="description" content="Browse our featured catalog of premium tech items and accessories." />

      <h2>Product Catalog</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {products.map((product) => (
          <div 
            key={product.id} 
            onClick={() => onSelectProduct(product)}
            style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', cursor: 'pointer' }}
          >
            <img src={product.image} alt={product.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
            <h3>{product.name}</h3>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
            <p style={{ fontSize: '14px', color: '#555' }}>{product.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}