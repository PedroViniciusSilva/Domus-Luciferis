import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  telemetry: false,
  css: ['~/assets/css/main.css'],

  // Isso aqui força o Tailwind a rodar de forma ultra-simples
  tailwindcss: {
    exposeConfig: false,
    viewer: false,
    injectPosition: 0 // Força a injeção no topo
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/content'
  ]
})