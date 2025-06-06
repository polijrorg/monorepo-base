import InitialNav from "@/components/nav/InitialNav";
import Embarcar from "./Embarcar";
import { headers } from "next/headers";
import { auth } from "@/auth";
import CarouselExample from "./CarouselExample";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  const isLogged = !!session?.user;

  return (
    <div className="min-h-screen">
      <InitialNav isLogged={isLogged} />
      
      <main className="h-[70vh] w-full pt-20 pb-16
      flex items-center justify-center gap-24 xl:gap-30">
        <div className="w-[40%] h-full rounded-2xl bg-gray-700 ">

        </div>

        <div className="flex flex-col gap-6">
          <h1 className="font-bold text-5xl">Aprenda do seu jeito</h1>
          <p className="text-xl font-medium [&>span]:text-pink-500 [&>span]:font-bold">
            Escolha o que <span>te interessa</span> e customize para o seu modo<br/>
            preferido de aprender, com <span>vídeos</span>, <span>textos</span>, <span>podcasts</span>,<br/>
            <span>exercícios</span>, <span>simulações</span> e <span>muita interatividade!</span>
          </p>
        </div>
      </main>

      <Embarcar isLogged={isLogged} />

      <CarouselExample />
    </div>
  );
}