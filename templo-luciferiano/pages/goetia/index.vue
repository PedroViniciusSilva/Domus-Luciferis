<template>
  <div class="bg-neutral-950 min-h-screen text-gray-300 pb-20">
    <TheNavbar />

    <main class="max-w-7xl mx-auto pt-16 px-6">
      <div class="text-center mb-16">
        <h1 class="text-5xl font-serif text-yellow-600 mb-4 tracking-wider">Ars Goetia</h1>
        <div class="w-24 h-px bg-yellow-800 mx-auto mb-6"></div>
        <p class="text-gray-400 max-w-2xl mx-auto leading-relaxed text-lg">
          A antiga arte da evocação. Navegue pelos 72 Espíritos e pelas Altas Entidades do Templo.
        </p>
      </div>

      <div v-for="grupo in hierarquiasGoeticas" :key="grupo.titulo" class="mb-16">
        <div class="mb-6 border-b border-yellow-900/30 pb-2">
          <h2 class="text-2xl font-serif text-yellow-500 uppercase tracking-widest">{{ grupo.titulo }}</h2>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          <NuxtLink 
            v-for="daemon in grupo.daemons" 
            :key="daemon.slug"
            :to="`/goetia/${daemon.slug}`" 
            class="group relative bg-black border border-yellow-900/30 rounded-md flex flex-col items-center justify-between aspect-[3/4] overflow-hidden hover:border-yellow-500 hover:shadow-[0_0_15px_rgba(202,138,4,0.2)] transition duration-300"
          >
            <div v-if="daemon.numero" class="absolute top-2 left-2 z-10">
              <span class="text-yellow-900 font-serif text-xs">{{ daemon.numero }}</span>
            </div>

            <div class="flex-grow flex items-center justify-center w-full p-2 relative z-0">
              <img 
                :src="`/sigilos/${daemon.slug}.png`" 
                :alt="`Sigilo de ${daemon.nome}`"
                class="w-full h-full object-contain opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                onerror="this.style.opacity='0'"
              />
            </div>

            <div class="w-full bg-neutral-950 py-2 border-t border-yellow-900/30 text-center relative z-10">
              <h3 class="text-sm font-serif text-yellow-600">{{ daemon.nome }}</h3>
            </div>

            <div class="absolute inset-0 bg-black/95 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 text-center z-20">
              <h3 class="text-lg font-serif text-yellow-400 mb-1">{{ daemon.nome }}</h3>
              <p class="text-[10px] text-yellow-700 uppercase tracking-widest mb-2 border-b border-yellow-900/50 pb-1 w-full">{{ daemon.rank }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
// O Nuxt importa o composable automaticamente!
const { hierarquiasGoeticas } = useGoetia()
</script>