import { AiChat } from "@/components/ai";

// Página de exemplo do assistente. Em projeto real, o chat costuma ficar
// dentro da tela onde o usuário trabalha (painel lateral, gaveta), não numa página própria.
function Assistente() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 md:p-8">
      <header>
        <h1 className="text-2xl font-semibold">Assistente</h1>
        <p className="text-sm text-muted-foreground">
          Respostas baseadas nos seus documentos. Ações que alteram dados pedem a sua confirmação.
        </p>
      </header>
      <AiChat
        suggestions={[
          "O que dizem meus documentos sobre reembolso?",
          "Quem tem acesso ao sistema?",
          "Troque meu nome para Maria Souza",
        ]}
      />
    </main>
  );
}

export default Assistente;
