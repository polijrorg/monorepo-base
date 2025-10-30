import LandingPagesNav from "@/components/base/nav/InitialNav";
import Image from "next/image";
import Link from "next/link";

function NotFound() {
  return ( 
    <div className="flex flex-col min-h-screen">
      <LandingPagesNav isLogged={false} />

      <main className="flex-1 flex flex-col gap-2 items-center justify-start text-pink-900">
        <Image
          src='/under-construction.png'
          alt=""
          width={300}
          height={300}

        />
        <h1 className="text-pink-500 font-bold text-8xl mt-2">404</h1>
        <p className="font-semibold text-4xl">Página não encontrada</p>
        <p className="text-xl leading-7 max-w-[445px] text-center">Ainda estamos trabalhando para adicionar novas páginas e serviços</p>

        <Link href='/' className="button-md bg-pink-500 text-white border-pink-300 text-xl mt-2">Voltar ao início</Link>
      </main>
    </div>
   );
}

export default NotFound;