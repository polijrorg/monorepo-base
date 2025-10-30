import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import LoginOptionals from "../auth/LoginOptionals";
import RequiredTag from "../input/RequiredTag";

import dynamic from 'next/dynamic';

const CredentialsButton = dynamic(() => import('@/components/auth/CredentialsButton'));
const ValidatedInput = dynamic(() => import('@/components/base/input/ValidatedInput'));

interface CredentialsLoginFormProps {
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setLoading: (loading: boolean) => void;
  email: string;
  password: string;
  loading: boolean;
  callbackUrl?: string;
  className?: string;
}

function CredentialsLoginForm({ 
  setEmail, 
  setPassword, 
  setLoading,
  email, 
  password,
  loading,
  callbackUrl,
  className
}: CredentialsLoginFormProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: callbackUrl ?? "/",
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
    <form className={className ?? ''} onSubmit={handleSubmit}>
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
        containerClassName="mt-4"
        labelClassName="auth-label"
        inputClassName="auth-input"
        iconContainerClassName="auth-icon"
        required
      ><RequiredTag/></ValidatedInput>

      <LoginOptionals />

      <CredentialsButton className="mt-6" disabled={loading}>Entrar</CredentialsButton>
    </form>
   );
}

export default CredentialsLoginForm;