'use client';

interface Product {
  id: number;
  name: string;
  effects: string;
  lore: string;
  price: number;
}

interface CartHook {
  (): {
    addToCart: (product: Product) => void;
    removeFromCart: (productId: number) => void;
  };
}

export default function ProductCard({ 
  product,
  useCartHook 
}: { 
  product: Product;
  useCartHook: CartHook;
}) {
  const { addToCart, removeFromCart } = useCartHook();

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <div className="effects" dangerouslySetInnerHTML={{ __html: product.effects.replace(/\n/g, '<br />') }} />
      <div className="lore">{product.lore}</div>
      <div className="price">{product.price.toLocaleString('pt-BR')} moedas</div>
      <div className="buttons">
        <button className="add-btn" onClick={() => addToCart(product)}>+</button>
        <button className="remove-btn" onClick={() => removeFromCart(product.id)}>-</button>
      </div>
    </div>
  );
}