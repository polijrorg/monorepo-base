import Link from "next/link";
import NavbarLogo from "../NavbarLogo";
import { UserRound } from "lucide-react";

function LandingPagesNav({ isLogged }: { isLogged: boolean }) {
  return ( 
    <nav className="w-full py-6 px-8
    flex items-center justify-between">
      <div className="text-pink-500">
        <NavbarLogo isH2 />
      </div>

      <ul className="flex items-center gap-4 text-xl">
        {isLogged ? (
          <li className="ml-8">
            <Link href='/aprender' className="button-md border-pink-200 text-pink-50 bg-pink-500 flex items-center gap-2">
              <UserRound /> Aprender
            </Link>
          </li>
        )
        : (
          <>
            <li className="ml-8">
              <Link href='/login' className="button-md ">Entrar</Link>
            </li>
            <li>
              <Link href='/cadastro' className="button-md border-pink-200 text-pink-50 bg-pink-500">Cadastro</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
   );
}

export default LandingPagesNav;