import LandingPagesNav from "@/components/base/nav/InitialNav";
import Embarcar from "./_components/Embarcar";
import { headers } from "next/headers";
import { auth } from "@/auth";
import CarouselExample from "./_components/CarouselExample";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  const isLogged = !!session?.user;

  return (
    <div className="min-h-screen">
      <LandingPagesNav isLogged={isLogged} />
      
      <main className="h-[70vh] w-full pt-20 pb-16 flex flex-col items-center justify-center text-center">
        <h1 className="font-bold text-5xl text-pink-800">Página de Exemplo</h1>
        <p className="pt-4 text-xl">Comece a editar seu site em <em className="text-pink-400">/app/(frontend)/(landing-pages)/page.tsx</em></p>
      </main>

      <div className="w-full flex items-center justify-center">
        <Embarcar isLogged={isLogged} />
      </div>

      <p className="text-center pt-8">um carousel de exemplo :)</p>
      <CarouselExample />
    </div>
  );
}