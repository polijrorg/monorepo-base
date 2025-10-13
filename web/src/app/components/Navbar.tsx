'use client';

import { useState } from 'react';
import CartDrawer from './CartDrawer';

export default function Navbar({ useCartHook }: { useCartHook: any }) {
  const { user, totalItems, logout } = useCartHook();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="logo">🔮 Loja Secreta</div>
      <div className="user">{user || 'Herói'}</div>
      <div className="cart" onClick={() => setIsCartOpen(true)}>
        🎒 <span className="cart-count">{totalItems}</span>
      </div>
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        useCartHook={useCartHook}
      />
    </nav>
  );
}