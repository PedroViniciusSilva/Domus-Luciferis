<template>
  <div class="bg-neutral-950 min-h-screen text-gray-300">
    <TheNavbar />
    
    <!-- Hero Section -->
    <header class="relative h-[70vh] flex items-center justify-center overflow-hidden border-b border-yellow-900/20">
      <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519751138087-5bf79df62d5b')] bg-cover bg-center opacity-20 grayscale"></div>
      <div class="relative text-center px-4">
        <h1 class="text-7xl font-serif text-yellow-600 mb-4 drop-shadow-[0_0_15px_rgba(202,138,4,0.3)]">Sactum Luciferis</h1>
        <p class="max-w-2xl mx-auto text-lg leading-relaxed text-gray-400 italic">
          "Não adoramos deuses, despertamos a divindade em nós mesmos. O Luciferianismo é a senda da sabedoria, da liberdade e da soberania individual."
        </p>
      </div>
    </header>

    <!-- Seção Sobre Nós -->
    <section class="max-w-4xl mx-auto py-20 px-6 text-center">
      <h2 class="text-3xl font-serif text-yellow-700 mb-8 uppercase tracking-widest">O Nosso Templo</h2>
      <div class="space-y-6 text-lg leading-relaxed">
        <p>
          O Nosso Templo não é um lugar de submissão, mas um laboratório de evolução. 
          Diferente das religiões dogmáticas, buscamos a iluminação através do autoconhecimento 
          e do equilíbrio entre a luz da razão e a sombra do instinto.
        </p>
        <p>
          Aqui, estudamos a <strong>Goetia</strong>, a <strong>Magia Cerimonial</strong> e a <strong>Filosofia Ocultista</strong> 
          para que cada membro se torne o arquiteto do seu próprio destino.
        </p>
      </div>
      
      <div class="mt-16 grid md:grid-cols-3 gap-8 text-center">
        <div class="p-6 border border-yellow-900/30 rounded-lg hover:border-yellow-600/50 transition">
          <h3 class="text-yellow-600 font-serif mb-2">Conhecimento</h3>
          <p class="text-sm text-gray-500">Acesso a grimórios e estudos exclusivos.</p>
        </div>
        <div class="p-6 border border-yellow-900/30 rounded-lg hover:border-yellow-600/50 transition">
          <h3 class="text-yellow-600 font-serif mb-2">Poder</h3>
          <p class="text-sm text-gray-500">Prática de rituais para manifestação da vontade.</p>
        </div>
        <div class="p-6 border border-yellow-900/30 rounded-lg hover:border-yellow-600/50 transition">
          <h3 class="text-yellow-600 font-serif mb-2">Liberdade</h3>
          <p class="text-sm text-gray-500">A quebra das correntes dos dogmas escravizantes.</p>
        </div>
      </div>
    </section>

    <footer class="py-10 border-t border-yellow-900/20 text-center text-xs text-gray-600 uppercase tracking-widest">
      © 2026 Templo Luciferiano - Pela Luz do Conhecimento
    </footer>
  </div>
</template>