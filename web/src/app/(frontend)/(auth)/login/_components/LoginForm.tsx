'use client'
import Link from "next/link";
import { useState, useEffect } from "react";

import LoginOptionals from "@/components/auth/LoginOptionals";

import RequiredTag from "@/components/base/input/RequiredTag";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

import dynamic from 'next/dynamic';

const GoogleAuthButton = dynamic(() => import('@/components/auth/GoogleLoginButton'));
const CredentialsButton = dynamic(() => import('@/components/auth/CredentialsButton'));
const ValidatedInput = dynamic(() => import('@/components/base/input/ValidatedInput'));

function LoginForm() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
      });

      if (result.error) {
        toast.error((result.error?.message || 'Erro desconhecido'))
      }
    } catch (error) {
      toast.error('Erro: ' + String(error))
    } finally {
      setLoading(false);
    }
  };

  return ( 
    <div className="lg:w-[90%] xl:w-[80%]">
      <h2 className="font-bold text-[40px] text-center leading-12">Continue seu aprendizado</h2>
      <form className="mt-6" onSubmit={handleSubmit}>
        <ValidatedInput 
          title="E-mail"
          placeholder="exemplo@noctiluz.com.br"
          name="email"
          type="email"
          value={email}
          setValue={setEmail}
          labelClassName='auth-label'
          inputClassName='auth-input'
          iconContainerClassName="auth-icon"
          required
        ><RequiredTag/></ValidatedInput>
        
        <ValidatedInput 
          title="Senha"
          placeholder="Insira sua senha"
          name="password"
          type="password"
          value={password}
          setValue={setPassword}

          overrideValidate={(val) => val.length >= 6}

          containerClassName="mt-4"
          labelClassName="auth-label"
          inputClassName="auth-input"
          iconContainerClassName="auth-icon"
          required
        ><RequiredTag/></ValidatedInput>

        <LoginOptionals />

        <CredentialsButton className="mt-6" disabled={loading}>Entrar</CredentialsButton>
      </form>
      
      <div className="flex items-center gap-4 py-5">
        <div className="flex-grow h-0.5 bg-gray-400" />
        <p className="text-gray-400 text-lg">ou</p>
        <div className="flex-grow h-0.5 bg-gray-400" />
      </div>

      <GoogleAuthButton disabled={loading} text="Entrar com Google" />

      <Link href='/cadastro' className="block w-fit mt-8 text-sm group">Ainda não tem uma conta? <span className="text-pink-500 colorTransition border-b border-transparent group-hover:border-pink-500">Cadastre-se</span></Link>
    </div>
   );
}

export default LoginForm;