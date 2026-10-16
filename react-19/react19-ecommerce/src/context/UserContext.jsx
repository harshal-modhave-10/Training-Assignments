// src/context/UserContext.js
import { createContext, useState, use } from 'react';

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <UserContext value={{ user, setUser }}>
      {children}
    </UserContext>
  );
}

export function useUser() {
  const context = use(UserContext); // React 19 use() for Context
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}