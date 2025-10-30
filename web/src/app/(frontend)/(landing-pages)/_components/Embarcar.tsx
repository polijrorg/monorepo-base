'use client';

import Link from 'next/link';

function Embarcar({ isLogged }: { isLogged: boolean }) {
  return (
    <Link
      href={isLogged ? '/aprender' : '/cadastro'}
      className="text-pink-50 text-4xl button-lg border-pink-200 bg-pink-500 colorTransition hover:bg-pink-400"
    >
      {isLogged ? 'Continue Aprendendo' : 'Cadastro (exemplo)'}
    </Link>
  );
}

export default Embarcar;
