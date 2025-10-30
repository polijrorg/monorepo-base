import Noctiluz from '@/components/svgs/noctiluz.svg'
import LoginForm from './_components/LoginForm';

function LoginPage() {
  return ( 
    <main className="lg:h-screen flex">
      <div className="w-[55%] h-full flex flex-col gap-8 items-center justify-center">
        <LoginForm />
      </div>

      <div className="login-background h-full w-[45%] flex flex-col items-center py-32">
        <div className="text-pink-500 flex gap-4">
          <Noctiluz className="w-[115px]" />
          <h1 className='font-bold text-[64px]'>noctiluz</h1>
        </div>
      </div>
    </main>
   );
}

export default LoginPage;