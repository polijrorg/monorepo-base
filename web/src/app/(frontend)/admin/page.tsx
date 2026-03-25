import AdminForm from './AdminForm';

function AdminLogin() {
  return ( 
    <>
      <main className="lg:h-screen flex">
        <div className="w-[55%] h-full flex flex-col gap-8 items-center justify-center">
          <AdminForm />
        </div>

        <div className="bg-pink-950 h-full w-[45%] flex flex-col items-center justify-center">
          <div className="text-pink-300 flex flex-col gap-4 w-fit">
            <h1 className='font-bold text-2xl text-center'>Painel de Administrador de Conteúdo<br/> (apenas funcionários!!!)</h1>
          </div>
        </div>
      </main>
    </>
   );
}

export default AdminLogin;