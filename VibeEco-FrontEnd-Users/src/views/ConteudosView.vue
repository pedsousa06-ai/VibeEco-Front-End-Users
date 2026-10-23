<script setup>
import { computed, ref } from 'vue'
import Icone from '@/components/Icone.vue'

// TODO: trocar os dados mockados abaixo por chamadas à API
// As imagens ficam em public/conteudos/ (ex.: public/conteudos/reciclagem.jpg)
const conteudos = [
  { id: 1, categoria: 'Reciclagem', titulo: 'Guia de Reciclagem Doméstica', leitura: 8, xp: 50, concluido: true, imagem: '/conteudos/reciclagem.jpg' },
  { id: 2, categoria: 'Energia', titulo: 'Energia Solar: Como Funciona', leitura: 12, xp: 75, concluido: false, imagem: '/conteudos/energia-solar.jpg' },
  { id: 3, categoria: 'Alimentação', titulo: 'Alimentação Sustentável no Dia a Dia', leitura: 6, xp: 60, concluido: false, imagem: '/conteudos/alimentacao.jpg' },
  { id: 4, categoria: 'Água', titulo: 'Consumo Consciente de Água', leitura: 7, xp: 50, concluido: true, imagem: '/conteudos/agua.jpg' },
  { id: 5, categoria: 'Reciclagem', titulo: 'Compostagem em Casa', leitura: 10, xp: 40, concluido: false, imagem: '/conteudos/compostagem.jpg' },
  { id: 6, categoria: 'Mobilidade', titulo: 'Mobilidade Urbana Sustentável', leitura: 9, xp: 60, concluido: false, imagem: '/conteudos/mobilidade.jpg' },
  { id: 7, categoria: 'Biodiversidade', titulo: 'Biodiversidade e Ecossistemas', leitura: 11, xp: 70, concluido: false, imagem: '/conteudos/biodiversidade.jpg' },
  { id: 8, categoria: 'Energia', titulo: 'Eficiência Energética em Casa', leitura: 8, xp: 50, concluido: true, imagem: '/conteudos/eficiencia-energetica.jpg' },
  { id: 9, categoria: 'Biodiversidade', titulo: 'Plantio Nativo e Reflorestamento', leitura: 13, xp: 80, concluido: false, imagem: '/conteudos/reflorestamento.jpg' },
]

// Ordem dos filtros igual ao Figma
const categorias = ['Todos', 'Água', 'Reciclagem', 'Energia', 'Alimentação', 'Biodiversidade', 'Mobilidade']

// Cor de fundo exibida enquanto a foto carrega (ou se a imagem não existir)
const fundoPorCategoria = {
  Água: ['#0ea5e9', '#0c4a6e'],
  Reciclagem: ['#22c55e', '#14532d'],
  Energia: ['#facc15', '#a16207'],
  Alimentação: ['#fb7185', '#9f1239'],
  Biodiversidade: ['#4ade80', '#166534'],
  Mobilidade: ['#a78bfa', '#4c1d95'],
}
function fundo(categoria) {
  const [a, b] = fundoPorCategoria[categoria] || ['#4ade80', '#14532d']
  return { background: `linear-gradient(135deg, ${a}, ${b})` }
}

const busca = ref('')
const categoriaAtiva = ref('Todos')

// Remove acentos e maiúsculas para a busca ("agua" encontra "Água")
function normalizar(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const filtrados = computed(() => {
  const termo = normalizar(busca.value.trim())
  return conteudos.filter((c) => {
    const bateCategoria = categoriaAtiva.value === 'Todos' || c.categoria === categoriaAtiva.value
    const bateBusca = !termo || normalizar(c.titulo).includes(termo)
    return bateCategoria && bateBusca
  })
})

function limparFiltros() {
  busca.value = ''
  categoriaAtiva.value = 'Todos'
}

// Se a foto não carregar, some a <img> e fica só o fundo em degradê
function esconderImagem(evento) {
  evento.target.style.display = 'none'
}
</script>

<template>
  <div class="conteudos-view">
    <!-- BUSCA E FILTROS -->
    <section class="filtros" aria-label="Buscar e filtrar conteúdos">
      <label class="busca">
        <span class="sr-only">Buscar conteúdos</span>
        <svg
          class="busca-icone"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input v-model="busca" type="search" placeholder="Buscar conteúdos..." />
      </label>

      <div class="chips" role="group" aria-label="Filtrar por categoria">
        <button
          v-for="categoria in categorias"
          :key="categoria"
          type="button"
          class="chip"
          :class="{ 'chip-ativo': categoria === categoriaAtiva }"
          :aria-pressed="categoria === categoriaAtiva"
          @click="categoriaAtiva = categoria"
        >
          {{ categoria }}
        </button>
      </div>
    </section>

    <!-- LISTA -->
    <section aria-label="Lista de conteúdos">
      <p class="sr-only" aria-live="polite">
        {{ filtrados.length }} {{ filtrados.length === 1 ? 'conteúdo encontrado' : 'conteúdos encontrados' }}
      </p>

      <div v-if="filtrados.length" class="lista">
        <article v-for="conteudo in filtrados" :key="conteudo.id" class="card conteudo">
          <div class="foto" :style="fundo(conteudo.categoria)">
            <img :src="conteudo.imagem" alt="" loading="lazy" @error="esconderImagem" />

            <span class="foto-tag">{{ conteudo.categoria }}</span>

            <span v-if="conteudo.concluido" class="foto-check" title="Concluído">
              <Icone nome="check" :tamanho="14" />
              <span class="sr-only">Concluído</span>
            </span>
          </div>

          <div class="conteudo-info">
            <strong>{{ conteudo.titulo }}</strong>

            <div class="conteudo-meta">
              <small class="leitura">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                {{ conteudo.leitura }} min leitura
              </small>
              <span class="xp">+{{ conteudo.xp }} XP</span>
            </div>

            <!-- TODO: ligar à rota de detalhe quando existir (ex.: /conteudos/:id) -->
            <button type="button" class="botao" :class="{ 'botao-suave': conteudo.concluido }">
              {{ conteudo.concluido ? 'Revisar conteúdo' : 'Iniciar conteúdo' }}
            </button>
          </div>
        </article>
      </div>

      <div v-else class="vazio card">
        <strong>Nenhum conteúdo encontrado</strong>
        <p>Tente outro termo de busca ou escolha uma categoria diferente.</p>
        <button type="button" class="botao botao-suave botao-auto" @click="limparFiltros">
          Limpar filtros
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.conteudos-view {
  display: grid;
  gap: 18px;
}

/* ---------- BASE COMPARTILHADA (mesmo padrão da InicioView) ---------- */
.card {
  border: 1px solid var(--borda);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(18, 38, 26, 0.04);
}
.xp {
  display: inline-flex;
  align-items: center;
  color: #d97706;
  font-size: 13px;
  font-weight: 700;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ---------- BUSCA E FILTROS ---------- */
.filtros {
  display: grid;
  gap: 14px;
}
.busca {
  position: relative;
  display: block;
  width: min(100%, 340px);
}
.busca-icone {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  color: var(--texto-suave);
  pointer-events: none;
}
.busca input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  border: 1px solid var(--borda);
  border-radius: 10px;
  background: #fff;
  font: inherit;
  font-size: 13px;
  color: inherit;
}
.busca input::placeholder {
  color: var(--texto-suave);
}
.busca input:focus-visible {
  outline: 2px solid var(--verde-600);
  outline-offset: 2px;
  border-color: transparent;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  padding: 6px 14px;
  border: 1px solid var(--borda);
  border-radius: 99px;
  background: #fff;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  color: inherit;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.chip:hover {
  border-color: #bfe0c8;
  background: var(--verde-100);
}
.chip-ativo,
.chip-ativo:hover {
  border-color: #126b36;
  background: #126b36;
  color: #fff;
}
.chip:focus-visible {
  outline: 2px solid var(--verde-600);
  outline-offset: 2px;
}

/* ---------- LISTA ---------- */
.lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.conteudo {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s;
}
.conteudo:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px -12px rgba(18, 38, 26, 0.25);
}

/* Foto do card */
.foto {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}
.foto img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.foto-tag {
  position: absolute;
  left: 10px;
  bottom: 10px;
  padding: 3px 10px;
  border-radius: 99px;
  background: rgba(8, 50, 26, 0.88);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
}
.foto-check {
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #16a34a;
  color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

/* Texto do card */
.conteudo-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px 16px;
}
.conteudo-info strong {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
}
.conteudo-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.leitura {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--texto-suave);
}

/* Botões */
.botao {
  width: 100%;
  margin-top: auto;
  padding: 9px 16px;
  border: 1px solid #126b36;
  border-radius: 8px;
  background: #126b36;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.botao:hover {
  border-color: #0d5429;
  background: #0d5429;
}
.botao-suave {
  border-color: var(--borda);
  background: #f1f5f2;
  color: #1f3a2a;
}
.botao-suave:hover {
  border-color: #bfe0c8;
  background: var(--verde-100);
}
.botao:focus-visible {
  outline: 2px solid var(--verde-600);
  outline-offset: 3px;
}
.botao-auto {
  width: auto;
}

/* ---------- ESTADO VAZIO ---------- */
.vazio {
  display: grid;
  justify-items: center;
  gap: 6px;
  padding: 40px 20px;
  text-align: center;
}
.vazio strong {
  font-size: 16px;
}
.vazio p {
  margin: 0 0 10px;
  font-size: 14px;
  color: var(--texto-suave);
}

@media (prefers-reduced-motion: reduce) {
  .conteudo,
  .chip,
  .botao {
    transition: none;
  }
}
</style>