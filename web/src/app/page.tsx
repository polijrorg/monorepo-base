'use client';

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import SearchBar from './components/SearchBar';

// Tipos
interface Product {
  id: number;
  name: string;
  effects: string;
  lore: string;
  price: number;
}

interface CartItem extends Product {
  quantity: number;
}

// Produtos da Loja Secreta
const PRODUCTS: Product[] = [
  { id: 1, name: "Perseverança", effects: "+6,5 de regeneração de vida, +2,25 de regeneração de mana.", lore: "“Uma gema que concede coragem ao portador.”", price: 1700 },
  { id: 2, name: "Amplificador Espiritual", effects: "+425 de vida, +425 de mana.", lore: "“Uma pedra pulsante que amplifica a energia vital e espiritual do herói.”", price: 3200 },
  { id: 3, name: "Fragmento Lunar", effects: "+200 de velocidade de ataque, pode ser consumido para conceder visão noturna adicional e bônus permanente de velocidade de ataque.", lore: "“Um fragmento banhado pela luz da lua, irradiando poder e serenidade.”", price: 4000 },
  { id: 4, name: "Orbe de Lótus", effects: "+10 de armadura, +6,5 de regeneração de vida, +250 de mana, +4 de regeneração de mana.\nAtivo: Echo Shell — reflete magias direcionadas por 6 segundos.", lore: "“A joia em seu centro ainda reflete a pálida imagem de seu criador.”", price: 4000 },
  { id: 5, name: "Pedra de Sangue", effects: "+500 de vida, +500 de mana, +3 de regeneração de mana, +30% de roubo de vida mágico.\nAtivo: Bloodpact — multiplica o roubo de vida mágico em 2,5× por 6 segundos.", lore: "“A cor rubi brilhante da Bloodstone é inconfundível no campo de batalha, símbolo de vitalidade e espírito infinitos.”", price: 4900 },
  { id: 6, name: "Olho de Skadi", effects: "+25 em todos os atributos, ataques reduzem velocidade de movimento e ataque, e diminuem cura e regeneração em 40%.", lore: "“Artefato extremamente raro, guardado pelos dragões azuis.”", price: 5500 },
  { id: 7, name: "Foice de Vyse", effects: "+30 de inteligência, +8,5 de regeneração de mana.\nAtivo: Hex — transforma o inimigo em criatura indefesa por 2,8 segundos.", lore: "“A relíquia mais guardada entre o culto de Vyse, cobiçada por todos os magos.”", price: 5700 },
  { id: 8, name: "Núcleo Octarina", effects: "+625 de vida, +625 de mana, +6 de regeneração de mana, 25% de redução de tempo de recarga em habilidades e itens.", lore: "“No âmago da feitiçaria estão espectros que apenas os mais dotados percebem.”", price: 5900 },
  { id: 9, name: "Rapieira Divina", effects: "+350 de dano de ataque.\nCai no chão ao morrer e pode ser pega por qualquer jogador.", lore: "“A lendária lâmina que decide o destino de batalhas — poder absoluto, ao preço da própria vida.”", price: 6000 }
];

// Hook personalizado para gerenciar o carrinho
const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [user, setUser] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user');
    }
    return null;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) {
        return current.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(current => {
      const existing = current.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return current.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return current.filter(item => item.id !== productId);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const login = (username: string) => {
    setUser(username);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', username);
    }
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return {
    cart,
    user,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    clearCart,
    login,
    logout
  };
};

// Funções de simulação de API
const simularCompra = () => {
  if (confirm("Simular compra de todos os itens no inventário?")) {
    alert("✅ Compra realizada com sucesso!\nItens adicionados ao seu herói.");
  }
};

const simularVenda = (cart: CartItem[]) => {
  if (cart.length === 0) {
    alert("❌ Seu inventário está vazio!");
    return;
  }
  
  if (confirm("Vender todos os itens do inventário?")) {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`✅ Itens vendidos com sucesso!\nVocê recebeu ${total.toLocaleString('pt-BR')} moedas.`);
    return total;
  }
  return null;
};

// Componente principal da página
export default function Home() {
  const cartHook = useCart();
  const { user, logout } = cartHook;
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(PRODUCTS);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (savedUser) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    if (username.trim()) {
      localStorage.setItem('user', username.trim());
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
  };

  const handleVender = () => {
    const total = simularVenda(cartHook.cart);
    if (total !== null) {
      cartHook.clearCart();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div className="login-box">
          <h2>🔮 Loja Secreta</h2>
          <input
            type="text"
            placeholder="Seu nome de herói"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin}>Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Navbar useCartHook={() => ({ 
        user: cartHook.user, 
        totalItems: cartHook.totalItems,
        logout: cartHook.logout 
      })} />
      
      <SearchBar products={PRODUCTS} onFilter={setFilteredProducts} />
      
      <main className="products-grid">
        {filteredProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            useCartHook={() => ({ 
              addToCart: cartHook.addToCart, 
              removeFromCart: cartHook.removeFromCart 
            })} 
          />
        ))}
      </main>

      {/* Botões de API */}
      <div className="api-buttons">
        <button onClick={simularCompra}>Comprar Itens</button>
        <button onClick={handleVender}>Vender Itens</button>
        <button onClick={handleLogout}>Sair</button>
      </div>
    </div>
  );
}