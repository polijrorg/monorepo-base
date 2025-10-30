'use client'
import Link from "next/link";
import { useState, useEffect } from "react";

import PasswordRequirement from "./PasswordRequirement";
import RequiredTag from "@/components/base/input/RequiredTag";
import { hasLowercase, hasMinLength, hasNumber, hasUppercase, validatePassword, validateConfirmPassword } from "@/utils";

import { toast } from "react-hot-toast";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";

import dynamic from 'next/dynamic';

const GoogleAuthButton = dynamic(() => import('@/components/auth/GoogleLoginButton'));
const CredentialsButton = dynamic(() => import('@/components/auth/CredentialsButton'));
const ValidatedInput = dynamic(() => import('@/components/base/input/ValidatedInput'));

function CadastroForm() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }

      if (!validatePassword(password)) {
        toast.error("A senha não atende aos requisitos mínimos");
        return;
      }

      const result = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: "/",
      });

      if (result.error) {
        if (result.error.message?.includes('already exists') || result.error.message?.includes('duplicate')) {
          toast.error("Este email já está cadastrado");
        } else {
          toast.error(result.error.message || "Erro inesperado");
        }
      } else {
        toast.success(`Bem-vindo(a), ${name}!`);
        
        setTimeout(() => {
          redirect('/');
        }, 1000);
      }
    } catch (error: unknown) {
      console.error('Signup error:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((error as any).message ?? "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return ( 
    <div className="flex items-center justify-center">
      <div className="pt-6 mb-12 px-2">
        <h2 className="font-bold text-[40px] text-center leading-12">Aprenda se divertindo!</h2>
        <p className="text-gray-500 pt-1 mb-8">Lições, exercícios, simulações e muita interatividade customizados <b>da forma que você preferir</b></p>
        
        <GoogleAuthButton disabled={loading} text="Cadastro com Google" />

        <div className="flex items-center gap-4 py-5">
          <div className="flex-grow h-0.5 bg-gray-400" />
          <p className="text-gray-400 text-lg">ou</p>
          <div className="flex-grow h-0.5 bg-gray-400" />
        </div>

        <form className="" onSubmit={handleCredentialsSubmit}>
          <div className="flex flex-col gap-4">
            <ValidatedInput
              title="Nome"
              placeholder="Vagalume da Silva"
              name="name"
              type="text"
              value={name}
              setValue={setName}
              labelClassName='auth-label'
              inputClassName='auth-input'
              iconContainerClassName="auth-icon"
              required
            ><RequiredTag/></ValidatedInput>
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
              overrideValidate={validatePassword}
              labelClassName="auth-label"
              inputClassName="auth-input"
              iconContainerClassName="auth-icon"
              required
            ><RequiredTag/></ValidatedInput>
            <ValidatedInput
              title="Confirmar Senha"
              placeholder="Confirme sua senha"
              name="confirmPassword"
              type="password"
              dependencies={[password]}
              value={confirmPassword}
              setValue={setConfirmPassword}
              overrideValidate={(val) => validateConfirmPassword(val, password)}
              labelClassName="auth-label"
              inputClassName="auth-input"
              iconContainerClassName="auth-icon"
              required
            ><RequiredTag/></ValidatedInput>
            <p>
              Senha deve ter pelo menos:
              
              <PasswordRequirement 
                text="1 letra maiúscula"
                validateFunction={() => hasUppercase(password)}
              />
              <PasswordRequirement 
                text="1 letra minúscula"
                validateFunction={() => hasLowercase(password)}
              />
              <PasswordRequirement 
                text="1 número"
                validateFunction={() => hasNumber(password)}
              />
              <PasswordRequirement 
                text="8 caracteres"
                validateFunction={() => hasMinLength(password)}
              />
            </p>
          </div>
          <CredentialsButton disabled={loading} className="mt-6">Cadastro</CredentialsButton>
        </form>
        
        <Link href='/login' className="block w-fit mt-8 text-sm group">Já tem uma conta? <span className="text-pink-500 colorTransition border-b border-transparent group-hover:border-pink-500">Login</span></Link>
      </div>
    </div>
   );
}

export default CadastroForm;