// src/components/SearchInput.jsx
// React 19: ref is passed directly as a standard prop!
export function SearchInput({ ref, placeholder }) {
  return (
    <input 
      ref={ref} 
      type="text" 
      placeholder={placeholder} 
      style={{ padding: '8px', width: '100%', marginBottom: '15px' }} 
    />
  );
}