<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Icone from '@/components/Icone.vue'
import { carregarTelaInicial } from '@/services/telaInicio'
import { calcularSequencia, semanaAtual } from '@/services/ofensiva'

const route = useRoute()
const dados = ref(null)
const carregando = ref(true)
const erro = ref('')
const montado = ref(false)
let timer

async function carregarTela() {
  carregando.value = true
  erro.value = ''
  try {
    const dadosApi = await carregarTelaInicial()

    console.log(dadosApi.conteudos_recomendados)

    dados.value = dadosApi
  } catch (e) {
    erro.value = 'Não foi possível carregar a tela inicial. Tente novamente.'
    if (import.meta.env.DEV) console.error(e)
  } finally {
    carregando.value = false
    timer = setTimeout(() => (montado.value = true), 80)
  }
}

onMounted(carregarTela)

// O SEGREDO: Se a rota mudar para '/inicio', recarrega os dados automaticamente
watch(() => route.path, (novoPath) => {
  if (novoPath === '/inicio') {
    carregarTela()
  }
})

onBeforeUnmount(() => {
  clearTimeout(timer)
})

function iniciaisDe(nome = '') {
  const partes = nome.trim().split(/\s+/)
  const primeira = partes[0]?.[0] ?? ''
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toUpperCase()
}

const perfil = computed(() => {
  const u = dados.value?.usuario ?? {}
  return {
    nome: u.nome_usuario ?? 'Lucas Oliveira',
    inicias: iniciaisDe(u.nome_usuario ?? 'Lucas Oliveira'),
    nivel: `Nível ${u.nivel_atual ?? 1} - ${u.nome_level ?? 'Iniciante'}`,
    xp: u.xp_usuario ?? 0,
    xpProximoNivel: u.xp_proximo_level ?? 500,
    mc: u.coins_usuario ?? 0,
    progresso: Number(u.progresso_percentual) || 0,
  }
})

const porcentagemNivel = computed(() => Math.min(100, Math.max(0, perfil.value.progresso)))

const saudacao = computed(() => {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia,'
  if (hora < 18) return 'Boa tarde,'
  return 'Boa noite,'
})

const resumo = computed(() => {
  const u = dados.value?.usuario ?? {}
  return [
    { numero: u.qtd_missoes_em_andamento ?? 2, rotulo: 'Missões em Andamento', icone: 'alvo', cor: 'verde' },
    { numero: u.qtd_missoes_concluidas ?? 1, rotulo: 'Missões Concluídas', icone: 'medalha', cor: 'amarelo' },
    { numero: u.qtd_desafios_ativos ?? 1, rotulo: 'Desafios Ativos', icone: 'raio', cor: 'roxo' },
    {
      numero: u.posicao_ranking ?? 3,
      prefixo: '#',
      rotulo: 'Posição no Ranking',
      detalhe: `Top ${Number(u.ranking_top_percentual) || 10}% na instituição`,
      icone: 'trofeu',
      cor: 'laranja',
    },
  ]
})

const missoes = computed(() =>
  (dados.value?.missoes_em_andamento ?? []).map((m) => ({
    id: m.id_missao ?? m.id,
    titulo: m.nome_missao ?? m.titulo ?? 'Missão',
    categoria: Array.isArray(m.categoria)
      ? m.categoria.map((c) => c.nome_categoria).join(', ')
      : m.categoria || 'Geral',
    dificuldade: m.nome_dificuldade ?? m.dificuldade ?? 'Fácil',
    xp: m.xp_missao ?? m.total_xp_missao ?? 0,
    progresso: Math.min(100, Math.max(0, Number(m.progresso_missao) || 0)),
    prazo: m.prazo_dias != null ? `${m.prazo_dias} dias` : '—',
  }))
)

const conteudos = computed(() => {
  const lista = dados.value?.conteudos_recomendados ?? []
  const vistos = new Set()
  
  return lista
    .filter(c => {
      const titulo = c.nome_conteudo ?? 'Conteúdo'
      if (vistos.has(titulo)) return false
      vistos.add(titulo)
      return true
    })
    .map((c) => ({
      id: c.id_conteudo_educativo ?? c.id,
      titulo: c.nome_conteudo ?? 'Conteúdo',
      categoria: c.categoria || 'Geral',
      xp: c.qtde_xp ?? 0,
      leitura: c.duracao_leitura ? `${c.duracao_leitura} min de leitura` : '',
      concluido: Boolean(c.concluido),
    }))
})

const diasSemana = [
  { letra: 'S', nome: 'Segunda' },
  { letra: 'T', nome: 'Terça' },
  { letra: 'Q', nome: 'Quarta' },
  { letra: 'Q', nome: 'Quinta' },
  { letra: 'S', nome: 'Sexta' },
  { letra: 'S', nome: 'Sábado' },
  { letra: 'D', nome: 'Domingo' },
]
const sequencia = computed(() => calcularSequencia(dados.value?.ofensiva ?? []))
const semana = computed(() => semanaAtual(dados.value?.ofensiva ?? []))
const indiceHoje = (new Date().getDay() + 6) % 7

function textoDias(n) {
  return n === 1 ? '1 dia' : `${n} dias`
}

const desafios = computed(() =>
  (dados.value?.desafios_destaque ?? []).map((d) => ({
    id: d.id,
    titulo: d.nome_desafio ?? d.titulo ?? 'Desafio',
    participantes: d.qtde_participantes ?? d.participantes ?? 0,
    dias: d.prazo_dias ?? 0,
    mc: d.super_coins ?? d.mc ?? 0,
    urgente: (d.prazo_dias ?? 0) <= 1,
  }))
)

function textoPrazo(dias) {
  if (dias <= 0) return 'Encerra hoje'
  return dias === 1 ? 'Encerra em 1 dia' : `Encerra em ${dias} dias`
}

const ICONE_PADRAO = '/icone-conquista.png'
function imagemFalhou(e) {
  const img = e.target
  if (img.dataset.padrao) return
  img.dataset.padrao = '1'
  img.src = ICONE_PADRAO
}

const conquistas = computed(() =>
  (dados.value?.conquistas_recentes ?? []).map((c) => ({
    id: c.id_usuario_conquista,
    nome: c.nome_conquista,
    descricao: c.descricao_conquista,
    imagem: c.img_conquista?.startsWith('https://') ? c.img_conquista : ICONE_PADRAO,
  }))
)

function classeDificuldade(texto) {
  return texto.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}
</script>

<template>
  <div class="inicio">
    <p v-if="carregando" role="status">Carregando...</p>
    <p v-else-if="erro" role="alert">{{ erro }}</p>

    <template v-else>
      <section class="banner entrada" aria-label="Boas-vindas">
        <div class="banner-texto">
          <small>{{ saudacao }}</small>
          <h2>{{ perfil.nome }}!</h2>
          <p v-if="sequencia > 0">
            Você está em uma ofensiva de <strong>{{ textoDias(sequencia) }}</strong>. Continue assim!
          </p>
          <p v-else>Conclua uma missão ou conteúdo hoje para começar sua ofensiva</p>

          <div class="banner-chips">
            <span><Icone nome="estrela" :tamanho="15" preenchido />{{ perfil.xp.toLocaleString('pt-BR') }} XP</span>
            <span><Icone nome="moeda" :tamanho="16" />{{ perfil.mc }} MC</span>
            <span><Icone nome="chama" :tamanho="15" />{{ textoDias(sequencia) }}</span>
          </div>
        </div>

        <div class="banner-nivel">
          <div class="banner-avatar" aria-hidden="true">{{ perfil.inicias }}</div>
          <small>{{ perfil.nivel }}</small>
          <div class="barra barra-clara" role="progressbar" aria-label="Progresso para o próximo nível" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="porcentagemNivel">
            <div class="barra-preenchimento" :style="{ width: (montado ? porcentagemNivel : 0) + '%' }"></div>
          </div>
          <small class="banner-xp">
            {{ perfil.xp.toLocaleString('pt-BR') }} / {{ perfil.xpProximoNivel.toLocaleString('pt-BR') }} XP
          </small>
        </div>
      </section>

      <section class="resumo" aria-label="Resumo">
        <article v-for="(item, i) in resumo" :key="item.rotulo" class="card resumo-card entrada" :style="{ '--i': i + 1 }">
          <div class="resumo-icone" :class="'cor-' + item.cor">
            <Icone :nome="item.icone" :tamanho="22" />
          </div>
          <div class="resumo-texto">
            <strong>{{ item.prefixo }}{{ item.numero }}</strong>
            <span>{{ item.rotulo }}</span>
            <small v-if="item.detalhe">{{ item.detalhe }}</small>
          </div>
        </article>
      </section>

      <div class="grade">
        <div class="coluna">
          <section aria-labelledby="titulo-missoes">
            <div class="cabecalho-secao">
              <h3 id="titulo-missoes">Missões em Andamento</h3>
              <RouterLink to="/missoes" class="ver-todas">Ver todas <Icone nome="seta" :tamanho="14" /></RouterLink>
            </div>

            <p v-if="!missoes.length" class="vazio">
              Você ainda não tem missões em andamento.
              <RouterLink to="/missoes">Ver missões</RouterLink>
            </p>

            <RouterLink v-for="(missao, i) in missoes" :key="missao.id" :to="`/missoes/${missao.id}`" class="card missao entrada" :style="{ '--i': i + 3 }">
              <div class="missao-cima">
                <div>
                  <div class="missao-tags">
                    <span v-if="missao.categoria !== 'Geral'" class="tag">{{ missao.categoria }}</span>
                    <span class="dificuldade" :class="'dif-' + classeDificuldade(missao.dificuldade)">{{ missao.dificuldade }}</span>
                  </div>
                  <strong class="missao-titulo">{{ missao.titulo }}</strong>
                </div>
                <div class="missao-lado">
                  <span class="xp"><Icone nome="estrela" :tamanho="14" preenchido />{{ missao.xp }} XP</span>
                  <small>Prazo: {{ missao.prazo }}</small>
                </div>
              </div>
              <div class="missao-progresso">
                <small>Progresso</small>
                <small>{{ missao.progresso }}%</small>
              </div>
              <div class="barra" role="progressbar" :aria-label="`Progresso da missão ${missao.titulo}`" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="missao.progresso">
                <div class="barra-preenchimento" :style="{ width: (montado ? missao.progresso : 0) + '%' }"></div>
              </div>
            </RouterLink>
          </section>

          <section aria-labelledby="titulo-conteudos">
            <div class="cabecalho-secao">
              <h3 id="titulo-conteudos">Conteúdos Recomendados</h3>
              <RouterLink to="/conteudos" class="ver-todas">Ver todos <Icone nome="seta" :tamanho="14" /></RouterLink>
            </div>
            <p v-if="!conteudos.length" class="vazio">Nenhum conteúdo recomendado por enquanto.</p>
            <div class="conteudos">
              <RouterLink v-for="(conteudo, i) in conteudos" :key="conteudo.id" :to="`/conteudos/${conteudo.id}`" class="card conteudo entrada" :style="{ '--i': i + 6 }">
                <div class="conteudo-topo">
                  <span v-if="conteudo.categoria !== 'Geral'" class="tag">{{ conteudo.categoria }}</span>
                  <span v-if="conteudo.concluido" class="concluido"><Icone nome="check" :tamanho="14" />Concluído</span>
                </div>
                <strong>{{ conteudo.titulo }}</strong>
                <div class="conteudo-rodape">
                  <small>{{ conteudo.leitura }}</small>
                  <span class="xp"><Icone nome="estrela" :tamanho="13" preenchido />{{ conteudo.xp }} XP</span>
                </div>
              </RouterLink>
            </div>
          </section>
        </div>

        <div class="coluna">
          <article class="card lateral entrada" :style="{ '--i': 4 }">
            <h3 class="lateral-titulo"><Icone nome="chama" :tamanho="18" class="icone-laranja" />Ofensiva Diária</h3>
            <div class="ofensiva">
              <strong>{{ sequencia }}</strong>
              <span>{{ sequencia === 1 ? 'dia consecutivo' : 'dias consecutivos' }}</span>
            </div>
            <div class="dias" role="list">
              <span v-for="(dia, i) in diasSemana" :key="i" class="dia" :class="{ 'dia-ativo': semana[i], 'dia-hoje': i === indiceHoje }" :style="{ '--i': i }" role="listitem" :aria-label="`${dia.nome}: ${semana[i] ? 'cumprido' : 'pendente'}`">{{ dia.letra }}</span>
            </div>
          </article>

          <article class="card lateral entrada" :style="{ '--i': 5 }">
            <div class="cabecalho-secao cabecalho-card">
              <h3 class="lateral-titulo"><Icone nome="raio" :tamanho="18" class="icone-roxo" />Desafios em Destaque</h3>
              <RouterLink to="/desafios" class="seta-link" aria-label="Ver todos os desafios"><Icone nome="seta" :tamanho="16" /></RouterLink>
            </div>
            <p v-if="!desafios.length" class="vazio">Nenhum desafio em destaque no momento</p>
            <div v-for="desafio in desafios" :key="desafio.id" class="desafio">
              <div>
                <strong>{{ desafio.titulo }}</strong>
                <small>{{ desafio.participantes }} {{ desafio.participantes === 1 ? 'participante' : 'participantes' }}</small>
                <small :class="{ urgente: desafio.urgente }">{{ textoPrazo(desafio.dias) }}</small>
              </div>
              <span class="xp"><Icone nome="moeda" :tamanho="13" preenchido />{{ desafio.mc }} MC</span>
            </div>
          </article>

          <article class="card lateral entrada" :style="{ '--i': 6 }">
            <h3 class="lateral-titulo"><Icone nome="medalha" :tamanho="18" class="icone-amarelo" />Conquistas Recentes</h3>
            <div class="conquistas">
              <div v-for="(conquista, i) in conquistas" :key="conquista.id" class="conquista" :title="conquista.descricao" :style="{ '--i': i }">
                <span class="conquista-icone cor-amarelo" aria-hidden="true">
                  <img v-if="conquista.imagem" :src="conquista.imagem" alt="" loading="lazy" referrerpolicy="no-referrer" @error="imagemFalhou">
                </span>
                <span>{{ conquista.nome }}</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.inicio { display: grid; gap: 20px; }
.card { border: 1px solid var(--borda); border-radius: 16px; background: var(--superficie); box-shadow: 0 1px 2px rgba(18, 38, 26, 0.04); }
.tag { display: inline-block; padding: 3px 10px; border-radius: 99px; background: var(--verde-100); color: var(--verde-forte); font-size: 12px; font-weight: 600; }
.xp { display: inline-flex; align-items: center; gap: 4px; color: var(--amarelo-texto); font-size: 13px; font-weight: 700; }
.xp svg { color: #f5b301; }
.barra { height: 8px; border-radius: 99px; background: var(--trilho); overflow: hidden; }
.barra-preenchimento { position: relative; overflow: hidden; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #16a34a, #4ade80); transition: width 0.9s cubic-bezier(0.2, 0.8, 0.2, 1); }
.barra-clara { background: rgba(255, 255, 255, 0.25); }
.barra-clara .barra-preenchimento { background: linear-gradient(90deg, #86efac, #fff); }
.cor-verde   { background: color-mix(in srgb, #16a34a 16%, var(--superficie)); color: color-mix(in srgb, #16a34a 75%, var(--texto)); }
.cor-amarelo { background: color-mix(in srgb, #d97706 16%, var(--superficie)); color: color-mix(in srgb, #d97706 75%, var(--texto)); }
.cor-roxo    { background: color-mix(in srgb, #7c3aed 16%, var(--superficie)); color: color-mix(in srgb, #7c3aed 75%, var(--texto)); }
.cor-laranja { background: color-mix(in srgb, #ea580c 16%, var(--superficie)); color: color-mix(in srgb, #ea580c 75%, var(--texto)); }

.banner { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 28px 32px; overflow: hidden; border-radius: 20px; color: #fff; background: linear-gradient(110deg, #0c4a25 0%, #117a3d 55%, #1fa856 100%); box-shadow: 0 14px 30px -14px rgba(13, 95, 49, 0.6); }
.banner::before, .banner::after { content: ''; position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.07); pointer-events: none; }
.banner::before { top: -140px; right: -80px; width: 320px; height: 320px; }
.banner::after { right: 150px; bottom: -130px; width: 200px; height: 200px; }
.banner > * { position: relative; z-index: 1; }
.banner-texto small { font-size: 14px; opacity: 0.85; }
.banner-texto h2 { margin: 2px 0 6px; font-size: 34px; font-weight: 800; letter-spacing: -0.02em; }
.banner-texto p { margin: 0; font-size: 15px; opacity: 0.92; }
.banner-chips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
.banner-chips span { display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px; border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 10px; background: rgba(255, 255, 255, 0.14); backdrop-filter: blur(4px); font-size: 14px; font-weight: 600; }
.banner-chips svg { color: #fde68a; }
.banner-nivel { display: grid; justify-items: center; gap: 8px; width: 210px; flex: none; text-align: center; }
.banner-avatar { display: grid; place-items: center; width: 78px; height: 78px; border: 3px solid rgba(255, 255, 255, 0.45); border-radius: 50%; background: rgba(255, 255, 255, 0.16); box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.08); font-size: 26px; font-weight: 800; }
.banner-nivel small { font-size: 13px; opacity: 0.9; }
.banner-nivel .barra { width: 100%; }
.banner-xp { font-size: 12px; opacity: 0.75; }

.resumo { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.resumo-card { display: flex; align-items: center; gap: 16px; padding: 20px; transition: transform 0.15s, box-shadow 0.15s; }
.resumo-card:hover { transform: translateY(-2px); box-shadow: 0 10px 24px -12px rgba(18, 38, 26, 0.25); }
.resumo-icone { display: grid; place-items: center; flex: none; width: 48px; height: 48px; border-radius: 12px; }
.resumo-texto strong { display: block; font-size: 28px; font-weight: 800; line-height: 1.1; font-variant-numeric: tabular-nums; }
.resumo-texto span { display: block; margin-top: 2px; font-size: 14px; }
.resumo-texto small { display: block; margin-top: 2px; font-size: 12px; color: var(--texto-suave); }

.grade { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 24px; align-items: start; }
.coluna { display: grid; gap: 24px; min-width: 0; }
.cabecalho-secao { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.cabecalho-secao h3 { margin: 0; font-size: 18px; font-weight: 700; }
.ver-todas { display: inline-flex; align-items: center; gap: 2px; color: var(--verde-600); font-size: 14px; font-weight: 600; text-decoration: none; }
.ver-todas:hover { text-decoration: underline; }
.ver-todas:focus-visible, .seta-link:focus-visible { outline: 2px solid var(--verde-600); outline-offset: 3px; border-radius: 4px; }

.missao { display: block; color: inherit; text-decoration: none; margin-bottom: 12px; padding: 16px 20px 18px; transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s; }
.missao:last-child { margin-bottom: 0; }
.missao:hover { transform: translateY(-2px); border-color: color-mix(in srgb, var(--verde-600) 35%, var(--borda)); box-shadow: 0 10px 24px -12px rgba(18, 38, 26, 0.25); }
.missao-cima { display: flex; justify-content: space-between; gap: 16px; }
.missao-tags { display: flex; align-items: center; gap: 10px; }
.dificuldade { font-size: 12px; font-weight: 600; }
.dif-facil { color: var(--facil-texto); }
.dif-medio { color: var(--medio-texto); }
.dif-dificil { color: #dc2626; }
.missao-titulo { display: block; margin-top: 8px; font-size: 16px; font-weight: 700; }
.missao-lado { display: grid; justify-items: end; align-content: start; gap: 4px; flex: none; }
.missao-lado small { font-size: 12px; color: var(--texto-suave); }
.missao-progresso { display: flex; justify-content: space-between; margin: 10px 0 6px; font-size: 12px; color: var(--texto-suave); }

.conteudos { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.conteudo { display: flex; flex-direction: column; gap: 12px; padding: 16px; height: 100%; box-sizing: border-box; transition: transform 0.15s, box-shadow 0.15s; text-decoration: none; color: inherit; }
.conteudo:hover { transform: translateY(-2px); box-shadow: 0 10px 24px -12px rgba(18, 38, 26, 0.25); }
.conteudo-topo { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.conteudo-topo .tag { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60%; }
.concluido { display: inline-flex; align-items: center; gap: 4px; color: var(--verde-forte); font-size: 12px; font-weight: 600; white-space: nowrap; }
.conteudo strong { font-size: 15px; line-height: 1.4; flex-grow: 1; }
.conteudo-rodape { display: flex; align-items: center; justify-content: space-between; margin-top: auto; font-size: 12px; color: var(--texto-suave); }

.lateral { padding: 20px; }
.lateral-titulo { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 16px; font-weight: 700; }
.icone-laranja { color: #ea580c; }
.icone-roxo { color: #7c3aed; }
.icone-amarelo { color: #d97706; }
.ofensiva { display: grid; justify-items: center; margin: 12px 0 18px; }
.ofensiva strong { color: #ea580c; font-size: 52px; font-weight: 800; line-height: 1; }
.ofensiva span { margin-top: 6px; font-size: 14px; color: var(--texto-suave); }
.dias { display: flex; justify-content: center; gap: 8px; }
.dia { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: color-mix(in srgb, #ea580c 16%, var(--superficie)); color: color-mix(in srgb, #ea580c 75%, var(--texto)); font-size: 12px; font-weight: 700; }
.dia-ativo { background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; box-shadow: 0 4px 10px -4px rgba(234, 88, 12, 0.7); }
.cabecalho-card { margin-bottom: 14px; }
.seta-link { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; color: var(--verde-600); }
.seta-link:hover { background: var(--verde-100); }
.lateral-titulo + .desafio { margin-top: 14px; }
.desafio { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 14px; border-radius: 12px; background: var(--fundo); }
.desafio + .desafio { margin-top: 10px; }
.desafio strong { display: block; margin-bottom: 4px; font-size: 14px; }
.desafio small { display: block; font-size: 12px; line-height: 1.6; color: var(--texto-suave); }

.conquistas { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
.conquista { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 12px; background: var(--fundo); font-size: 13px; font-weight: 500; transition: transform 0.15s; }
.conquista:hover { transform: translateY(-2px); }
.conquista-icone { display: grid; place-items: center; flex: none; width: 38px; height: 38px; border-radius: 10px; font-size: 18px; }
.conquista-icone img { width: 100%; height: 100%; object-fit: contain; border-radius: inherit; }

@media (max-width: 1200px) { .grade { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 700px) { .banner { flex-direction: column; align-items: flex-start; padding: 22px 20px; } .banner-texto h2 { font-size: 28px; } .banner-nivel { width: 100%; justify-items: start; text-align: left; } .conquistas { grid-template-columns: 1fr; } }

.entrada { animation: entrar 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) backwards; animation-delay: calc(var(--i, 0) * 70ms); }
@keyframes entrar { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: none; } }

.vazio { margin: 0; padding: 20px; border: 1px dashed var(--borda); border-radius: 16px; color: var(--texto-suave); font-size: 14px; text-align: center; }
</style>