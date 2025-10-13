'use client';

import { useState, ChangeEvent } from 'react';

interface Product {
  id: number;
  name: string;
  effects: string;
  lore: string;
  price: number;
}

export default function SearchBar({ 
  products, 
  onFilter 
}: { 
  products: Product[]; 
  onFilter: (filtered: Product[]) => void; 
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.effects.toLowerCase().includes(term) ||
      product.lore.toLowerCase().includes(term)
    );
    
    onFilter(filtered);
  };

  return (
    <div className="search-box">
      <input
        type="text"
        placeholder="Buscar item..."
        value={searchTerm}
        onChange={handleSearch}
      />
    </div>
  );
}