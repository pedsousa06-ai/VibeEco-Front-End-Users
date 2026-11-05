<script setup>
import { onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import Icone from '@/components/Icone.vue';
import Interruptor from '@/components/Interruptor.vue';
import { sair } from '@/services/auth';
import { configuracoes } from '@/services/configuracoes';
import { usuario } from '@/services/usuario';

const router = useRouter()

const tamanhos = [
    { valor: 'pequeno', rotulo: 'Pequeno'},
    { valor: 'medio', rotulo: 'Medio'},
    { valor: 'grande', rotulo: 'Grande'},
]

const privacidade = [
    { chave: 'aparecerNoRanking', titulo: 'Aparecer no ranking', descricao: 'Seu nome ficará visível no ranking global'},
    { chave: 'atividadesVisiveis', titulo: 'Atividades visíveis', descricao: 'Outros usuários podem ver suas atividades'},
    { chave: 'perfilPublico', titulo: 'Perfil público', descricao: 'Qualquer pessoa pode ver seu perfil'},
]

// TODO: trocar os textos fixos por dados da API
const seguranca = [
    { titulo: 'Alterar senha', descricao: 'Última alteração: 30 dias atrás' },
    { titulo: 'Autenticação em dois fatores', descricao: 'Adicione uma camada extra de segurança' },
    { titulo: 'Sessões ativas', descricao: '2 sessões ativas no momento' },
]

// Mensagem rápida para recursos que ainda não existem
const aviso = ref('')
let timer
function avisar(texto) {
    aviso.value = texto
    clearTimeout(timer)
    timer = setTimeout(() => (aviso.value = ''), 3000)
}
onBeforeUnmount(() => clearTimeout(timer))

function deslogar() {
    sair()
    router.push({ name: 'tela-acesso'})
}
</script>

<template>
    <div class="config">
        <!-- COLUNA ESQUERDA -->
         <div class="coluna">
            <section class="card" aria-labelledby="t-conta">
                <header class="cabecalho">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"> 
                        <path d="M19 21v-2a4 4 0 0 0-4-4h9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <h2 id="t-conta">Conta</h2>
                </header>

                <dl class="dados">
                    <div class="linha">
                        <dt>Nome</dt>
                        <dd>{{ usuario.nome }}</dd>
                    </div>
                    <div class="linha">
                        <dt>E-mail</dt>
                        <dd>{{ usuario.email }}</dd>
                    </div>
                    <div class="linha">
                        <dt>Matrícula</dt>
                        <dd>{{ usuario.matricula ?? '-' }}</dd>
                    </div>
                    <div class="linha">
                        <dt><label for="idioma">Idioma</label></dt>
                        <dd>
                            <select id="idioma" v-model="configuracoes.idioma">
                                <option value="pt-BR">Português (Brasil)</option>
                                <option value="en" disabled>English (Em breve)</option>
                                <option value="es" disabled>Español (Em breve)</option>
                            </select>
                        </dd>
                    </div>
                </dl>
            </section>

            <section class="card" aria-labelledby="t-acessibilidade">
                <header class="cabecalho">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" 
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="12" cy="4.5" r="1.8" />
                        <path d="M5 8.5h14M12 8.5V14m0 0-3.5 6m3.5-6 3.5 6" />
                    </svg>
                    <h2 id="t-acessibilidade">Acessibilidade</h2>
                </header>

                <div class="linha">
                    <div class="texto">
                        <strong id="l-constraste">Alto contraste</strong>
                        <small>Aumenta o contraste das cores</small>
                    </div>
                    <Interruptor v-model="configuracoes.altoContraste" rotulo-id="l-contraste" />
                </div>

                <div class="linha">
                    <div class="texto">
                        <strong id="l-fonte">Tamanho da fonte</strong>
                        <small>Ajuste o tamanho do texto</small>
                    </div>
                    <div class="segmentos" role="radiogroup" aria-labelledby="l-fonte" >
                        <button
                        v-for="t in tamanhos"
                        :key="t.valor"
                        type="button"
                        role="radio"
                        class="segmento"
                        :class="{ ativo: configuracoes.tamanhoFonte === t.valor}"
                        :aria-checked="configuracoes.tamanhoFonte = t.valor"
                        >
                        {{ t.rotulo }}
                        </button>
                    </div>
                </div>

                <div class="linha">
                    <div class="texto">
                        <strong id="l-animacoes">Animações</strong>
                        <small>Ativa ou desativa animações na interface</small>
                    </div>
                    <Interruptor v-model="configuracoes.animacoes" rotulo-id="l-animacoes" />
                </div>
            </section>

            <section class="card" aria-labelledby="t-seguranca">
                <header class="cabecalho">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" 
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                    </svg>
                    <h2 id="t-seguranca">Segurança</h2>
                </header>

                <button
                v-for="item in seguranca"
                :key="item.titulo"
                type="button"
                class="linha clicavel"
                @click="avisar(`${item.titulo}: dispinível em breve.`)"
                >
                <span class="texto">
                    <strong>{{ item.titulo }}</strong>
                    <small>{{ item.descricao }}</small>
                </span>

                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" 
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" />
                </svg>
                </button>
            </section>
         </div>
         <!-- COLUNA DIREITA -->
        <div class="coluna">
            <section class="card" aria-labelledby="t-privacidade">
                <header class="cabecalho">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                    <h2 id="t-privacidade">Privacidade</h2>
                </header>

                <div v-for="item in privacidade" :key="item.chave" class="linha">
                    <div class="texto">
                        <strong :id="'l-' + item.chave">{{ item.titulo }}</strong>
                        <small>{{ item.descricao }}</small>
                    </div>
                    <Interruptor v-model="configuracoes[item.chave]" :rotulo-id="'l-' + item.chave" />
                </div>
            </section>

            <button type="button" class="sair" @click="deslogar">
                <Icone nome="sair" :tamanho="18" />
                Saida da conta
            </button>
        </div>

        <p v-if="aviso" class="aviso" role="status">{{ aviso }}</p>
    </div>
</template>

<style scoped>
.config {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  align-items: start;
  max-width: 1160px;
}
.coluna {
  display: grid;
  gap: 24px;
  min-width: 0;
}
 
.card {
  overflow: hidden;
  border: 1px solid var(--borda);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(18, 38, 26, 0.04);
}
.cabecalho {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: var(--fundo);
  color: var(--verde-900);
}
.cabecalho h2 {
  margin: 0;
  color: var(--texto);
  font-size: 15px;
  font-weight: 700;
}
 
.linha {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-height: 56px;
  padding: 10px 20px;
  box-sizing: border-box;
  border: 0;
  border-top: 1px solid var(--borda);
  background: none;
  color: var(--texto);
  font: inherit;
  text-align: left;
}
.texto strong {
  display: block;
  font-size: 14px;
  font-weight: 600;
}
.texto small {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: var(--texto-suave);
}
 
/* conta */
.dados {
  margin: 0;
}
.dados .linha {
  justify-content: flex-start;
  gap: 0;
  font-size: 14px;
}
.dados dt {
  flex: none;
  width: 120px;
  color: var(--texto-suave);
}
.dados dd {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
}
.dados select {
  width: 100%;
  padding: 6px 0;
  border: 0;
  background: transparent;
  color: var(--texto);
  font: inherit;
  cursor: pointer;
}
.dados select:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
  border-radius: 6px;
}
 
/* tamanho da fonte */
.segmentos {
  display: flex;
  gap: 6px;
}
.segmento {
  padding: 6px 12px;
  border: 0;
  border-radius: 8px;
  background: var(--fundo);
  color: var(--texto-suave);
  font: inherit;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
}
.segmento:hover {
  background: var(--verde-100);
}
.segmento.ativo {
  background: var(--verde-900);
  color: #fff;
}
.segmento:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
 
/* segurança */
.clicavel {
  cursor: pointer;
  color: var(--texto);
}
.clicavel:hover {
  background: var(--fundo);
}
.clicavel svg {
  flex: none;
  color: var(--texto-suave);
}
.clicavel:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: -3px;
}
 
/* sair */
.sair {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 46px;
  border: 1px solid #f3c9c9;
  border-radius: 12px;
  background: #fdf0f0;
  color: #c0392b;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.sair:hover {
  background: #fbe3e3;
}
.sair:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
 
/* aviso */
.aviso {
  position: fixed;
  left: 50%;
  bottom: 28px;
  z-index: 60;
  margin: 0;
  padding: 10px 18px;
  border-radius: 10px;
  background: var(--verde-950);
  color: #fff;
  font-size: 13.5px;
  transform: translateX(-50%);
  box-shadow: 0 10px 24px -10px rgba(0, 0, 0, 0.4);
}
 
@media (max-width: 900px) {
  .config {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 480px) {
  .dados dt {
    width: 90px;
  }
  .linha {
    padding: 10px 16px;
  }
}
</style>