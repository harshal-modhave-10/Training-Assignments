// src/App.jsx
import { Suspense, useState, useRef } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { productsPromise } from './data/products';
import { ProductList } from './components/ProductList';
import { RegistrationForm } from './components/RegistrationForm';
import { ProductDetail } from './components/ProductDetail';
import { SearchInput } from './components/SearchInput';

function UserHeader() {
  const { user } = useUser();
  return (
    <header style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '20px' }}>
      {user ? (
        <p style={{ margin: 0 }}>Registered User: <strong>{user.name}</strong> ({user.email})</p>
      ) : (
        <p style={{ margin: 0 }}>Status: Guest (Please register below)</p>
      )}
    </header>
  );
}

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState(0);
  const inputRef = useRef(null);

  const handleFocusSearch = () => {
    inputRef.current?.focus();
  };

  return (
    <UserProvider>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
        <UserHeader />

        <div style={{ marginBottom: '20px' }}>
          <button onClick={handleFocusSearch} style={{ marginBottom: '10px', padding: '6px 12px' }}>
            Focus Search (Ref as Prop Demo)
          </button>
          <SearchInput ref={inputRef} placeholder="Search products..." />
        </div>

        <RegistrationForm />

        <hr style={{ margin: '30px 0' }} />

        {/* React 19 Suspense Boundary for Async Promise consumption with use() */}
        <Suspense fallback={<div style={{ padding: '20px', fontSize: '18px' }}>Loading products...</div>}>
          <ProductList productsPromise={productsPromise} onSelectProduct={setSelectedProduct} />
        </Suspense>

        {selectedProduct && (
          <ProductDetail 
            product={selectedProduct} 
            cart={cart} 
            setCart={setCart} 
          />
        )}
      </div>
    </UserProvider>
  );
}