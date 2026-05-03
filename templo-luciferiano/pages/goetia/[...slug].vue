<template>
  <div class="bg-neutral-950 min-h-screen text-gray-300 pb-20 font-sans">
    <TheNavbar />

    <main v-if="daemonInfo" class="max-w-5xl mx-auto pt-24 px-6">
      
      <div class="flex flex-col md:flex-row items-center gap-8 mb-16 border-b border-yellow-900/30 pb-12">
        <div class="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 relative">
          <div class="absolute inset-0 bg-yellow-600/20 blur-[50px] rounded-full"></div>
          <img 
            :src="`/sigilos/${daemonInfo.slug}.png`" 
            :alt="`Sigilo de ${daemonInfo.nome}`"
            class="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(202,138,4,0.5)]"
            onerror="this.style.opacity='0'"
          />
        </div>
        
        <div class="text-center md:text-left">
          <p class="text-yellow-700 uppercase tracking-widest text-sm font-bold mb-2">{{ daemonInfo.rank }}</p>
          <h1 class="text-5xl md:text-7xl font-serif text-yellow-500 mb-4">{{ daemonInfo.nome }}</h1>
          <p class="text-xl text-gray-400 italic">"{{ daemonInfo.titulo_alternativo || 'Entidade do Templo' }}"</p>
        </div>
      </div>

      <div class="mb-16 bg-black border border-yellow-900/50 rounded-lg p-8 text-center relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
        <h3 class="text-yellow-800 uppercase tracking-widest text-xs mb-4 relative z-10">Mantra de Evocação (Enn)</h3>
        <p class="text-3xl md:text-4xl font-serif text-yellow-600 italic relative z-10 tracking-wider">
          "{{ daemonInfo.enn || 'Em transcrição...' }}"
        </p>
      </div>

      <div class="mb-16">
        <h2 class="text-2xl font-serif text-yellow-500 border-b border-yellow-900/30 pb-2 mb-6">Correspondências do Altar</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div v-for="(val, label) in { Planeta: 'planeta', Elemento: 'elemento', Metal: 'metal', Incenso: 'incenso', Dias: 'dias', Legiões: 'legioes' }" :key="label" 
               class="bg-neutral-900/50 border border-neutral-800 p-4 rounded text-center">
            <span class="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">{{ label }}</span>
            <span class="text-yellow-600 font-serif">{{ daemonInfo[val] || '...' }}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div class="space-y-8">
          <section>
            <h2 class="text-2xl font-serif text-yellow-500 border-b border-yellow-900/30 pb-2 mb-4">Origem e Natureza</h2>
            <div class="space-y-4">
              <p v-for="(p, i) in daemonInfo.historia" :key="i" class="text-gray-400 leading-relaxed text-justify">
                {{ p }}
              </p>
              <p v-if="!daemonInfo.historia" class="italic text-gray-600">Aguardando transcrição dos tomos...</p>
            </div>
          </section>
          
          <section>
            <h2 class="text-2xl font-serif text-yellow-500 border-b border-yellow-900/30 pb-2 mb-4">Domínios e Poderes</h2>
            <ul class="list-none space-y-2 text-gray-400">
              <li v-for="(poder, i) in daemonInfo.poderes" :key="i" class="flex items-start">
                <span class="text-yellow-600 mr-2">✦</span> {{ poder }}
              </li>
            </ul>
          </section>
        </div>

        <div class="space-y-8">
          <section>
            <h2 class="text-2xl font-serif text-yellow-500 border-b border-yellow-900/30 pb-2 mb-4">Temperamento</h2>
            <p class="text-gray-400 leading-relaxed text-justify">{{ daemonInfo.temperamento || 'Em observação...' }}</p>
          </section>
          
          <section class="bg-yellow-900/10 border border-yellow-900/30 p-6 rounded">
            <h2 class="text-xl font-serif text-yellow-500 mb-4 flex items-center">
              <span class="mr-2">🍷</span> Oferendas Agradáveis
            </h2>
            <ul class="list-disc list-inside space-y-1 text-gray-300">
              <li v-for="(item, i) in daemonInfo.oferendas" :key="i">{{ item }}</li>
            </ul>
          </section>
        </div>
      </div>

      <div class="text-center pt-8 border-t border-yellow-900/30">
        <NuxtLink to="/goetia" class="text-yellow-600 hover:text-yellow-400 uppercase tracking-widest text-sm transition border border-yellow-900/50 hover:border-yellow-500 px-8 py-3 rounded">
          Retornar ao Grimório
        </NuxtLink>
      </div>
    </main>

    <div v-else class="text-center pt-32 text-yellow-600 text-xl font-serif">
      <p class="animate-pulse">Evocando entidade...</p>
      <NuxtLink to="/goetia" class="text-xs text-gray-600 underline mt-4 block">Cancelar evocação</NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const { detalhesDaemons } = useGoetia() 

const daemonInfo = computed(() => {
  const slug = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug
  return detalhesDaemons[slug] || null
})
</script>