<template>
  <nav class="bg-black/90 border-b border-yellow-900/50 p-4 sticky top-0 z-50 backdrop-blur-md">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <NuxtLink to="/" class="text-2xl font-serif text-yellow-600 tracking-tighter hover:text-yellow-500 transition">
        TEMPLO LUCIFERIANO
      </NuxtLink>
      
      <div class="hidden md:flex space-x-8 text-sm uppercase tracking-widest text-gray-400">
        <NuxtLink to="/goetia" class="hover:text-yellow-500 transition">Goetia</NuxtLink>
        <NuxtLink to="/rituais" class="hover:text-yellow-500 transition">Rituais</NuxtLink>
        <NuxtLink to="/loja" class="hover:text-yellow-500 transition">Produtos</NuxtLink>
        <NuxtLink to="/membros" class="bg-yellow-900/20 px-4 py-1 border border-yellow-700/50 rounded text-yellow-600 hover:bg-yellow-900/40 transition">Iniciação</NuxtLink>
      </div>
    </div>
  </nav>
</template>