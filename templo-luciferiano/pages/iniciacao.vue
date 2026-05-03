<template>
  <div class="bg-neutral-950 min-h-screen text-gray-300 pb-20">
    <TheNavbar />

    <main class="max-w-3xl mx-auto pt-24 px-6">
      <div class="text-center mb-12">
        <h1 class="text-5xl font-serif text-yellow-600 mb-4 tracking-wider">O Pacto de Iniciação</h1>
        <div class="w-24 h-px bg-yellow-800 mx-auto mb-6"></div>
        <p class="text-gray-400 leading-relaxed text-lg">
          Adentrar o Templo é assumir a responsabilidade sobre sua própria luz e escuridão. 
          Preencha o pergaminho abaixo se estiver pronto para o despertar.
        </p>
      </div>

      <!-- Formulário Ritualístico -->
      <div class="bg-black border border-yellow-900/40 p-8 md:p-12 rounded-lg shadow-[0_0_40px_rgba(202,138,4,0.05)] relative overflow-hidden">
        
        <!-- Elementos decorativos nas bordas -->
        <div class="absolute top-0 left-0 w-16 h-16 border-t border-l border-yellow-900/50"></div>
        <div class="absolute top-0 right-0 w-16 h-16 border-t border-r border-yellow-900/50"></div>
        <div class="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-yellow-900/50"></div>
        <div class="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-yellow-900/50"></div>

        <form @submit.prevent="enviarPacto" class="relative z-10 space-y-6">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nome Profano -->
            <div>
              <label class="block text-yellow-700 text-xs uppercase tracking-widest mb-2">Nome de Nascimento</label>
              <input type="text" required class="w-full bg-neutral-900/50 border border-neutral-800 focus:border-yellow-600 text-gray-300 px-4 py-3 rounded outline-none transition" placeholder="Seu nome civil" />
            </div>
            <!-- Nome Mágico -->
            <div>
              <label class="block text-yellow-700 text-xs uppercase tracking-widest mb-2">Nome Mágico <span class="text-neutral-600">(Opcional)</span></label>
              <input type="text" class="w-full bg-neutral-900/50 border border-neutral-800 focus:border-yellow-600 text-gray-300 px-4 py-3 rounded outline-none transition" placeholder="Como deseja ser chamado" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- E-mail -->
            <div>
              <label class="block text-yellow-700 text-xs uppercase tracking-widest mb-2">E-mail de Contato</label>
              <input type="email" required class="w-full bg-neutral-900/50 border border-neutral-800 focus:border-yellow-600 text-gray-300 px-4 py-3 rounded outline-none transition" placeholder="seu@email.com" />
            </div>
            <!-- Data de Nascimento -->
            <div>
              <label class="block text-yellow-700 text-xs uppercase tracking-widest mb-2">Data de Nascimento</label>
              <input type="date" required style="color-scheme: dark;" class="w-full bg-neutral-900/50 border border-neutral-800 focus:border-yellow-600 text-gray-400 px-4 py-3 rounded outline-none transition" />
            </div>
          </div>

          <!-- Motivação -->
          <div>
            <label class="block text-yellow-700 text-xs uppercase tracking-widest mb-2">O que o atrai ao Caminho da Mão Esquerda?</label>
            <textarea required rows="4" class="w-full bg-neutral-900/50 border border-neutral-800 focus:border-yellow-600 text-gray-300 px-4 py-3 rounded outline-none transition resize-none" placeholder="Descreva sua busca espiritual e suas intenções com o Templo..."></textarea>
          </div>

          <!-- Termo de Responsabilidade -->
          <div class="flex items-start mt-8 p-4 bg-yellow-900/10 border border-yellow-900/20 rounded">
            <div class="flex items-center h-5 mt-0.5">
              <input id="pacto" type="checkbox" required class="w-4 h-4 bg-neutral-900 border-neutral-800 accent-yellow-600 cursor-pointer" />
            </div>
            <div class="ml-3 text-sm">
              <label for="pacto" class="text-gray-400 cursor-pointer leading-relaxed">
                Compreendo que a jornada luciferiana exige estudo constante, responsabilidade sobre os próprios atos e profundo respeito à egrégora. Aceito submeter meu pedido de iniciação à avaliação dos Mestres do Templo.
              </label>
            </div>
          </div>

          <!-- Botão Submit -->
          <div class="pt-6 text-center">
            <button type="submit" class="bg-neutral-950 border border-yellow-700 text-yellow-500 hover:bg-yellow-900/40 hover:text-yellow-400 px-10 py-4 uppercase tracking-widest text-sm font-serif transition duration-300 w-full md:w-auto shadow-[0_0_15px_rgba(202,138,4,0.1)] hover:shadow-[0_0_25px_rgba(202,138,4,0.3)]">
              Firmar o Pacto de Entrada
            </button>
          </div>

        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
const enviarPacto = () => {
  alert("Seu pedido foi selado e enviado aos Mestres do Templo. Aguarde o nosso contato.")
}
</script>