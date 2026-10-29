<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Icone from '@/components/Icone.vue';
import { CATEGORIAS, estiloCapa, listarConteudos } from '@/services/conteudos';

const router = useRouter()

const conteudos = ref([])
const carregando = ref(true)
const busca = ref('')
const filtro = ref('Todos')
const categorias = ['Todos', ...CATEGORIAS]

const normalizar = (texto) => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

const filtrados = computed(() => {
    const termo = normalizar(busca.value.trim())
    return conteudos.value.filter((c) => {
      const categoriaOK = filtro.value === 'Todos' || normalizar(c.categoria) === normalizar(filtro.value)
      const buscaOK = !termo || normalizar(c.titulo).includes(termo)
      return categoriaOK && buscaOK
    })
})


function abrir(id){
  router.push({ name: 'conteudo-detalhe', params: { id } })
}

onMounted(async() => {
  conteudos.value = await listarConteudos()
  carregando.value = false
})
</script>

<template>
  <section class="conteudos">
    <label class="busca">
      <Icone nome="busca" :tamanho="18"/>
      <input v-model="busca" type="search" placeholder="Buscar conteúdos..." aria-label="Buscar conteúdos" />
    </label>

    <div class="filtros" role="group" aria-label="Filtrar por categoria">
      <button
        v-for="categoria in categorias"
        :key="categoria"
        type="button"
        class="chip"
        :class="{ ativo : filtro === categoria }"
        :aria-pressed="filtro === categoria"
        @click="filtro = categoria"
      >
      {{ categoria }}
      </button>
    </div>

    <p v-if="carregando" class="aviso">carregando conteúdos...</p>
    <p v-else-if="!filtrados.length" class="aviso">
      Nenhum conteúdo encontrado. Tente outro termo ou escolha outra categoria
    </p>

    <ul v-else class="grade">
      <li v-for="c in filtrados" :key="c.id" class="card">
        <div class="capa" :style="estiloCapa(c)">
          <span class="tag">{{ c.categoria }}</span>
          <span v-if="c.concluido" class="check" role="img" aria-label="Concluído">
            <Icone nome="check" :tamanho="14"/>
          </span>
        </div>

        <div class="corpo">
          <h3>{{ c.titulo }}</h3>
          <div class="meta">
            <span>{{ c.minutos }} min leitura</span>
            <span class="xp"><Icone nome="estrela" :tamanho="13" preenchido/>{{ c.xp }} XP</span>
          </div>
          <button type="button" class="botao" :class="{ secundario: c.concluido }" @click="abrir (c.id)">
            {{  c.concluido ? 'Revisar conteúdo' : 'Iniciar conteúdo'  }}
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.conteudos {
  display: grid;
  gap: 16px;
}
 
.busca {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 420px;
  height: 40px;
  padding: 0 12px;
  box-sizing: border-box;
  border: 1px solid var(--borda);
  border-radius: 10px;
  background: #fff;
  color: var(--texto-suave);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.busca:focus-within {
  border-color: var(--verde-600);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18);
}
.busca input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: 14px;
  color: var(--texto);
}
 
.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  height: 34px;
  padding: 0 16px;
  border: 1px solid var(--borda);
  border-radius: 99px;
  background: #fff;
  color: var(--texto);
  font: inherit;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.chip:hover {
  border-color: var(--verde-600);
}
.chip.ativo {
  border-color: var(--verde-900);
  background: var(--verde-900);
  color: #fff;
}
.chip:focus-visible,
.botao:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
 
.aviso {
  margin: 0;
  padding: 48px 24px;
  border: 1px dashed var(--borda);
  border-radius: 16px;
  background: #fff;
  text-align: center;
  color: var(--texto-suave);
}
 
.grade {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
 
.card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--borda);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(18, 38, 26, 0.04);
  transition: transform 0.15s, box-shadow 0.15s;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px -12px rgba(18, 38, 26, 0.25);
}
 
.capa {
  position: relative;
  height: 140px;
  background-size: cover;
  background-position: center;
}
.capa::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 50%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.35));
}
.tag {
  position: absolute;
  left: 12px;
  bottom: 10px;
  z-index: 1;
  padding: 3px 10px;
  border-radius: 99px;
  background: var(--verde-900);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}
.check {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--verde-500);
  color: #fff;
}
 
.corpo {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 10px;
  padding: 16px;
}
.corpo h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
}
.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--texto-suave);
}
.xp {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #8a5a00;
  font-size: 13px;
  font-weight: 700;
}
.xp svg {
  color: #f5b301;
}
 
.botao {
  margin-top: auto;
  height: 40px;
  border: 0;
  border-radius: 10px;
  background: var(--verde-900);
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.botao:hover {
  background: var(--verde-950);
}
.botao.secundario {
  background: var(--fundo);
  color: var(--texto-suave);
}
.botao.secundario:hover {
  background: var(--verde-100);
  color: var(--texto);
}
 
@media (prefers-reduced-motion: reduce) {
  .card,
  .chip,
  .botao {
    transition: none;
  }
}
</style>