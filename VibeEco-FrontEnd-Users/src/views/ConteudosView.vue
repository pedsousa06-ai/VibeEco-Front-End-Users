<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Icone from '@/components/Icone.vue';
import { CATEGORIAS, estiloCapa, listarConteudos } from '@/services/conteudos';

const router = useRoute()

const conteudos = ref([])
const carregando = ref(true)
const busca = ref('')
const filtro = ref('Todos')
const categorias = ['Todos', ...CATEGORIAS]

const normalizar = (texto) => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

const filtrados = computed(() => {
    const termo = normalizar(busca.value.trim())
    return conteudos.value.filter((c) => {
      const categoriaOK = filtro.value === 'Todos' || c.categorias === filtro.value
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
          <button type="button" class="botao" :class="{ segundario: c.concluido }" @click="abrir (c.id)">
            {{  c.concluido ? 'Revisar conteúdo' : 'Iniciar conteúdo'  }}
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>

</style>