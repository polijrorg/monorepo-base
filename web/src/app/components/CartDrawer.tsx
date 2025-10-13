'use client';

interface CartHook {
  (): {
    cart: any[];
    totalPrice: number;
    clearCart: () => void;
  };
}

export default function CartDrawer({ 
  isOpen, 
  onClose,
  useCartHook
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  useCartHook: CartHook;
}) {
  const { cart, totalPrice, clearCart } = useCartHook();

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <h3>Inventário</h3>
        <ul className="cart-items">
          {cart.length === 0 ? (
            <li>Inventário vazio</li>
          ) : (
            cart.map((item: any) => (
              <li key={item.id}>
                <div>
                  <strong>{item.name}</strong> ×{item.quantity}
                </div>
                <div>{(item.price * item.quantity).toLocaleString('pt-BR')} moedas</div>
              </li>
            ))
          )}
        </ul>
        <p className="total">Total: {totalPrice.toLocaleString('pt-BR')} moedas</p>
        <div className="cart-buttons">
          <button className="clear-btn" onClick={clearCart}>Limpar</button>
          <button className="close-btn" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}