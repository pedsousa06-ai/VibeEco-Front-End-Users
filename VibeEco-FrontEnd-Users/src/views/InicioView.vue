<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Icone from '@/components/Icone.vue'
import { usuario } from '@/services/usuario'
import { missoesLista, progressoDe, rotuloPrazo, statusDe, xpTotal } from '@/services/missoes'
import { listarConteudos } from '@/services/conteudos'

// TODO: trocar os dados mockados abaixo por chamadas à API
const porcentagemNivel = computed(() =>
  Math.min(100, Math.round((usuario.xp / usuario.xpProximoNivel) * 100))
)

// Saudação conforme o horário
const saudacao = computed(() => {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia,'
  if (hora < 18) return 'Boa tarde,'
  return 'Boa noite,'
})

// As barras começam vazias e enchem logo após a tela abrir
const montado = ref(false)
let timer
onMounted(() => {
  timer = setTimeout(() => (montado.value = true), 80)
})
onBeforeUnmount(() => clearTimeout(timer))

const resumo = [
  { valor: '5', rotulo: 'Missões em Andamento', icone: 'alvo', cor: 'verde' },
  { valor: '23', rotulo: 'Missões Concluídas', icone: 'medalha', cor: 'amarelo' },
  { valor: '2', rotulo: 'Desafios Ativos', icone: 'raio', cor: 'roxo' },
  { valor: '#14', rotulo: 'Posição no Ranking', detalhe: 'Top 5% na instituição', icone: 'trofeu', cor: 'laranja' },
]

// Missões em andamento vêm do mesmo serviço da tela de Missões
const missoes = computed(() =>
  missoesLista
    .filter((m) => statusDe(m) === 'andamento')
    .slice(0, 3)
    .map((m) => ({
      id: m.id,
      categoria: m.categoria,
      dificuldade: m.dificuldade,
      titulo: m.titulo,
      xp: xpTotal(m),
      prazo: rotuloPrazo(m.prazo),
      progresso: progressoDe(m),
    }))
)

const todosConteudos = ref([])
onMounted(async () => {
  todosConteudos.value = await listarConteudos()
})

const conteudos = computed(() => 
  [...todosConteudos.value]
    .sort((a, b) => Number(a.concluido) - Number(b.concluido))
    .slice(0, 3)
    .map((c) => ({
      id: c.id,
      categoria: c.categoria,
      titulo: c.titulo,
      leitura: `${c.minutos} min leitura`,
      xp: c.xp,
      concluido: c.concluido
    }))
)

const diasSemana = [
  { letra: 'S', nome: 'Segunda' },
  { letra: 'T', nome: 'Terça' },
  { letra: 'Q', nome: 'Quarta' },
  { letra: 'Q', nome: 'Quinta' },
  { letra: 'S', nome: 'Sexta' },
  { letra: 'S', nome: 'Sábado' },
  { letra: 'D', nome: 'Domingo' },
]
// Quantos dos 7 dias da semana já estão cumpridos
const diasCumpridos = computed(() => Math.min(usuario.ofensiva, 7))

const desafios = [
  { id: 1, titulo: 'Semana sem Carro', participantes: 230, encerra: '5 dias', xp: 500 },
  { id: 2, titulo: 'Desafio da Água', participantes: 412, encerra: '1 dia', xp: 300 },
]

const conquistas = [
  { id: 1, nome: 'Primeira Missão', icone: '🌱', cor: 'verde' },
  { id: 2, nome: 'Reciclador', icone: '♻️', cor: 'verde' },
  { id: 3, nome: 'Guardião da Água', icone: '💧', cor: 'azul' },
  { id: 4, nome: 'Eco Energético', icone: '⚡', cor: 'amarelo' },
]

// "Médio" -> "medio" (usado só para escolher a cor da dificuldade)
function classeDificuldade(texto) {
  return texto.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}
</script>

<template>
  <div class="inicio">
    <!-- BANNER DE BOAS-VINDAS -->
    <section class="banner" aria-label="Boas-vindas">
      <div class="banner-texto">
        <small>{{ saudacao }}</small>
        <h2>{{ usuario.nome }}!</h2>
        <p>
          Você está em uma ofensiva de <strong>{{ usuario.ofensiva }} dias</strong>. Continue assim!
        </p>

        <div class="banner-chips">
          <span><Icone nome="estrela" :tamanho="15" preenchido />{{ usuario.xp.toLocaleString('pt-BR') }} XP</span>
          <span><Icone nome="moeda" :tamanho="16" />{{ usuario.mc }} MC</span>
          <span><Icone nome="chama" :tamanho="15" />{{ usuario.ofensiva }} dias</span>
        </div>
      </div>

      <div class="banner-nivel">
        <div class="banner-avatar" aria-hidden="true">{{ usuario.iniciais }}</div>
        <small>{{ usuario.nivel }}</small>

        <div
          class="barra barra-clara"
          role="progressbar"
          aria-label="Progresso para o próximo nível"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="porcentagemNivel"
        >
          <div class="barra-preenchimento" :style="{ width: (montado ? porcentagemNivel : 0) + '%' }"></div>
        </div>
        <small class="banner-xp">
          {{ usuario.xp.toLocaleString('pt-BR') }} / {{ usuario.xpProximoNivel.toLocaleString('pt-BR') }} XP
        </small>
      </div>
    </section>

    <!-- CARDS DE RESUMO -->
    <section class="resumo" aria-label="Resumo">
      <article v-for="item in resumo" :key="item.rotulo" class="card resumo-card">
        <div class="resumo-icone" :class="'cor-' + item.cor">
          <Icone :nome="item.icone" :tamanho="22" />
        </div>

        <div class="resumo-texto">
          <strong>{{ item.valor }}</strong>
          <span>{{ item.rotulo }}</span>
          <small v-if="item.detalhe">{{ item.detalhe }}</small>
        </div>
      </article>
    </section>

    <div class="grade">
      <!-- COLUNA ESQUERDA -->
      <div class="coluna">
        <section aria-labelledby="titulo-missoes">
          <div class="cabecalho-secao">
            <h3 id="titulo-missoes">Missões em Andamento</h3>
            <RouterLink to="/missoes" class="ver-todas">Ver todas <Icone nome="seta" :tamanho="14" /></RouterLink>
          </div>

          <RouterLink v-for="missao in missoes" :key="missao.id" :to="`/missoes/${missao.id}`" class="card missao">
            <div class="missao-cima">
              <div>
                <div class="missao-tags">
                  <span class="tag">{{ missao.categoria }}</span>
                  <span class="dificuldade" :class="'dif-' + classeDificuldade(missao.dificuldade)">
                    {{ missao.dificuldade }}
                  </span>
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
            <div
              class="barra"
              role="progressbar"
              :aria-label="`Progresso da missão ${missao.titulo}`"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-valuenow="missao.progresso"
            >
              <div class="barra-preenchimento" :style="{ width: (montado ? missao.progresso : 0) + '%' }"></div>
            </div>
          </RouterLink>
        </section>

        <section aria-labelledby="titulo-conteudos">
          <div class="cabecalho-secao">
            <h3 id="titulo-conteudos">Conteúdos Recomendados</h3>
            <RouterLink to="/conteudos" class="ver-todas">Ver todos <Icone nome="seta" :tamanho="14" /></RouterLink>
          </div>

          <div class="conteudos">
            <RouterLink v-for="conteudo in conteudos" :key="conteudo.id" :to="`/conteudos/${conteudo.id}`" class="card conteudo">
              <div class="conteudo-topo">
                <span class="tag">{{ conteudo.categoria }}</span>
                <span v-if="conteudo.concluido" class="concluido">
                  <Icone nome="check" :tamanho="14" />Concluído
                </span>
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

      <!-- COLUNA DA DIREITA -->
      <div class="coluna">
        <article class="card lateral">
          <h3 class="lateral-titulo"><Icone nome="chama" :tamanho="18" class="icone-laranja" />Ofensiva Diária</h3>

          <div class="ofensiva">
            <strong>{{ usuario.ofensiva }}</strong>
            <span>dias consecutivos</span>
          </div>

          <div class="dias" role="list">
            <span
              v-for="(dia, i) in diasSemana"
              :key="i"
              class="dia"
              :class="{ 'dia-ativo': i < diasCumpridos }"
              role="listitem"
              :aria-label="`${dia.nome}: ${i < diasCumpridos ? 'cumprido' : 'pendente'}`"
            >
              {{ dia.letra }}
            </span>
          </div>
        </article>

        <article class="card lateral">
          <div class="cabecalho-secao cabecalho-card">
            <h3 class="lateral-titulo"><Icone nome="raio" :tamanho="18" class="icone-roxo" />Desafios em Destaque</h3>
            <RouterLink to="/desafios" class="seta-link" aria-label="Ver todos os desafios">
              <Icone nome="seta" :tamanho="16" />
            </RouterLink>
          </div>

          <div v-for="desafio in desafios" :key="desafio.id" class="desafio">
            <div>
              <strong>{{ desafio.titulo }}</strong>
              <small>{{ desafio.participantes }} participantes</small>
              <small>Encerra em {{ desafio.encerra }}</small>
            </div>
            <span class="xp"><Icone nome="estrela" :tamanho="13" preenchido />{{ desafio.xp }} XP</span>
          </div>
        </article>

        <article class="card lateral">
          <h3 class="lateral-titulo"><Icone nome="medalha" :tamanho="18" class="icone-amarelo" />Conquistas Recentes</h3>

          <div class="conquistas">
            <div v-for="conquista in conquistas" :key="conquista.id" class="conquista">
              <span class="conquista-icone" :class="'cor-' + conquista.cor" aria-hidden="true">{{ conquista.icone }}</span>
              <span>{{ conquista.nome }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inicio {
  display: grid;
  gap: 20px;
}

/* ---------- BASE COMPARTILHADA ---------- */
.card {
  border: 1px solid var(--borda);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(18, 38, 26, 0.04);
}
.tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  background: var(--verde-100);
  color: #0f6b34;
  font-size: 12px;
  font-weight: 600;
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

.barra {
  height: 8px;
  border-radius: 99px;
  background: #d6eadb;
  overflow: hidden;
}
.barra-preenchimento {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #16a34a, #4ade80);
  transition: width 0.9s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.barra-clara {
  background: rgba(255, 255, 255, 0.25);
}
.barra-clara .barra-preenchimento {
  background: linear-gradient(90deg, #86efac, #fff);
}

.cor-verde {
  background: #dcf5e5;
  color: #16a34a;
}
.cor-amarelo {
  background: #fef3c7;
  color: #d97706;
}
.cor-roxo {
  background: #ede9fe;
  color: #7c3aed;
}
.cor-laranja {
  background: #ffedd5;
  color: #ea580c;
}
.cor-azul {
  background: #dbeafe;
  color: #2563eb;
}

/* ---------- BANNER ---------- */
.banner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 32px;
  overflow: hidden;
  border-radius: 20px;
  color: #fff;
  background: linear-gradient(110deg, #0c4a25 0%, #117a3d 55%, #1fa856 100%);
  box-shadow: 0 14px 30px -14px rgba(13, 95, 49, 0.6);
}
.banner::before,
.banner::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  pointer-events: none;
}
.banner::before {
  top: -140px;
  right: -80px;
  width: 320px;
  height: 320px;
}
.banner::after {
  right: 150px;
  bottom: -130px;
  width: 200px;
  height: 200px;
}
.banner > * {
  position: relative;
  z-index: 1;
}
.banner-texto small {
  font-size: 14px;
  opacity: 0.85;
}
.banner-texto h2 {
  margin: 2px 0 6px;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.banner-texto p {
  margin: 0;
  font-size: 15px;
  opacity: 0.92;
}
.banner-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}
.banner-chips span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(4px);
  font-size: 14px;
  font-weight: 600;
}
.banner-chips svg {
  color: #fde68a;
}

.banner-nivel {
  display: grid;
  justify-items: center;
  gap: 8px;
  width: 210px;
  flex: none;
  text-align: center;
}
.banner-avatar {
  display: grid;
  place-items: center;
  width: 78px;
  height: 78px;
  border: 3px solid rgba(255, 255, 255, 0.45);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.08);
  font-size: 26px;
  font-weight: 800;
}
.banner-nivel small {
  font-size: 13px;
  opacity: 0.9;
}
.banner-nivel .barra {
  width: 100%;
}
.banner-xp {
  font-size: 12px;
  opacity: 0.75;
}

/* ---------- RESUMO ---------- */
.resumo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.resumo-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  transition: transform 0.15s, box-shadow 0.15s;
}
.resumo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px -12px rgba(18, 38, 26, 0.25);
}
.resumo-icone {
  display: grid;
  place-items: center;
  flex: none;
  width: 48px;
  height: 48px;
  border-radius: 12px;
}
.resumo-texto strong {
  display: block;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
}
.resumo-texto span {
  display: block;
  margin-top: 2px;
  font-size: 14px;
}
.resumo-texto small {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: var(--texto-suave);
}

/* ---------- GRADE ---------- */
.grade {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 24px;
  align-items: start;
}
.coluna {
  display: grid;
  gap: 24px;
  min-width: 0;
}

.cabecalho-secao {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.cabecalho-secao h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}
.ver-todas {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: var(--verde-600);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}
.ver-todas:hover {
  text-decoration: underline;
}
.ver-todas:focus-visible,
.seta-link:focus-visible {
  outline: 2px solid var(--verde-600);
  outline-offset: 3px;
  border-radius: 4px;
}

/* ---------- MISSÕES ---------- */
.missao {
  display: block;
  color: inherit;
  text-decoration: none;
  margin-bottom: 12px;
  padding: 16px 20px 18px;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}
.missao:last-child {
  margin-bottom: 0;
}
.missao:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
.missao:hover {
  transform: translateY(-2px);
  border-color: #bfe0c8;
  box-shadow: 0 10px 24px -12px rgba(18, 38, 26, 0.25);
}
.missao-cima {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
.missao-tags {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dificuldade {
  font-size: 12px;
  font-weight: 600;
}
.dif-facil {
  color: #16a34a;
}
.dif-medio {
  color: #d97706;
}
.dif-dificil {
  color: #dc2626;
}
.missao-titulo {
  display: block;
  margin-top: 8px;
  font-size: 16px;
  font-weight: 700;
}
.missao-lado {
  display: grid;
  justify-items: end;
  align-content: start;
  gap: 4px;
  flex: none;
}
.missao-lado small {
  font-size: 12px;
  color: var(--texto-suave);
}
.missao-progresso {
  display: flex;
  justify-content: space-between;
  margin: 10px 0 6px;
  font-size: 12px;
  color: var(--texto-suave);
}

/* ---------- CONTEÚDOS ---------- */
.conteudos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
.conteudo {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  transition: transform 0.15s, box-shadow 0.15s;
  text-decoration: none;
  color: inherit;
}
.conteudo:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px -12px rgba(18, 38, 26, 0.25);
}
.conteudo-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.concluido {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #16a34a;
  font-size: 12px;
  font-weight: 600;
}
.conteudo strong {
  font-size: 15px;
  line-height: 1.3;
}
.conteudo-rodape {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  font-size: 12px;
  color: var(--texto-suave);
}

/* ---------- COLUNA DA DIREITA ---------- */
.lateral {
  padding: 20px;
}
.lateral-titulo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}
.icone-laranja {
  color: #ea580c;
}
.icone-roxo {
  color: #7c3aed;
}
.icone-amarelo {
  color: #d97706;
}

.ofensiva {
  display: grid;
  justify-items: center;
  margin: 12px 0 18px;
}
.ofensiva strong {
  color: #ea580c;
  font-size: 52px;
  font-weight: 800;
  line-height: 1;
}
.ofensiva span {
  margin-top: 6px;
  font-size: 14px;
  color: var(--texto-suave);
}
.dias {
  display: flex;
  justify-content: center;
  gap: 8px;
}
.dia {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #ffedd5;
  color: #c2410c;
  font-size: 12px;
  font-weight: 700;
}
.dia-ativo {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  box-shadow: 0 4px 10px -4px rgba(234, 88, 12, 0.7);
}

.cabecalho-card {
  margin-bottom: 14px;
}
.seta-link {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: var(--verde-600);
}
.seta-link:hover {
  background: var(--verde-100);
}
.lateral-titulo + .desafio {
  margin-top: 14px;
}
.desafio {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: var(--fundo);
}
.desafio + .desafio {
  margin-top: 10px;
}
.desafio strong {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
}
.desafio small {
  display: block;
  font-size: 12px;
  line-height: 1.6;
  color: var(--texto-suave);
}

.conquistas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;
}
.conquista {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: var(--fundo);
  font-size: 13px;
  font-weight: 500;
  transition: transform 0.15s;
}
.conquista:hover {
  transform: translateY(-2px);
}
.conquista-icone {
  display: grid;
  place-items: center;
  flex: none;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  font-size: 18px;
}

/* ---------- RESPONSIVO ---------- */
@media (max-width: 1200px) {
  .grade {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 700px) {
  .banner {
    flex-direction: column;
    align-items: flex-start;
    padding: 22px 20px;
  }
  .banner-texto h2 {
    font-size: 28px;
  }
  .banner-nivel {
    width: 100%;
    justify-items: start;
    text-align: left;
  }
  .conquistas {
    grid-template-columns: 1fr;
  }
}
@media (prefers-reduced-motion: reduce) {
  .barra-preenchimento,
  .resumo-card,
  .missao,
  .conteudo,
  .conquista {
    transition: none;
  }
}
</style>
