<script setup>
import { computed, reactive, ref } from 'vue';
import { usuario } from '@/services/usuario'; 
import Interruptor from '@/components/Interruptor.vue';
import { configuracoes } from '@/services/configuracoes';

const campos = ['nome', 'nomePublico', 'email', 'matricula', 'curso', 'localizacao', 'bio', 'foto']

const visibilidade = [
  { chave: 'perfilPublico', titulo: 'Perfil público', descricao: 'Qualquer pessoa pode ver seu perfil.' },
  { chave: 'aparecerNoRanking', titulo: 'Aparecer no ranking', descricao: 'Mostre seu nome no ranking global.' },
  { chave: 'atividadesVisiveis', titulo: 'Atividades visíveis', descricao: 'Permita que vejam suas ações recentes.' },
]

const completo = computed (() => {
    const preenchidos = campos.filter((c) => String(usuario[c] ?? '').trim() !=='').length
    return Math.round((preenchidos / campos.length) * 100)
})

const CIRCUNFERENCIA = 2 * Math.PI * 34 // raio 34, igual ao do SVG
const traco = computed(() => `${(completo.value / 100) * CIRCUNFERENCIA} ${CIRCUNFERENCIA}`)

function dadosAtuais(){
    return {
        nome: usuario.nome,
        nomePublico: usuario.nomePublico,
        curso: usuario.curso,
        localizacao: usuario.localizacao,
        bio: usuario.bio
    }
}

const form = reactive(dadosAtuais())

// O botão Salvar só liga se algo modou e o nome não está vazio
const alterado = computed(() => JSON.stringify(form) !== JSON.stringify(dadosAtuais()))
const valido = computed(() => form.nome.trim() !== '')

const salvo = ref(false)
let timer

function salvar() {
    if(!valido.value) return
    Object.assign(usuario, form) // copia o rascunho para o usuário
    salvo.value = true
    clearTimeout(timer)
    timer = setTimeout(() => (salvo.value = false), 3000)
}

function cancelar() {
    Object.assign(form, dadosAtuais()) // volta o rascunho ao que está salvo 
}

</script>

<template>
    <header class="titulo-pagina">
        <div>
            <h2>Dados e progresso do perfil</h2>
            <p>Gerencie suas informações, acompanhe sua evolução e celebre cada impacto positivo.</p>
        </div>
        <small>Dados atualizados agora</small>
    </header>

    <section class="card identidade" aria-label="Resumo do perfil">
        <span class="avatar-perfil" aria-hidden="true">{{ usuario.iniciais }}</span>
        <div class="id-dados">
            <h3>{{ usuario.nome }}</h3>
            <p>{{ usuario.curso }} • {{ usuario.instituicao }}</p>
            <ul class="selos">
                <li>{{ usuario.nivel }}</li>
                <li>{{ usuario.localizacao }}</li>
                <li>Desde {{ usuario.desde }}</li>
            </ul>
        </div>

        <div class="completude">
            <div class="anel">
                <svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
                    <circle class="trilha" cx="40" cy="40" r="34" />
                    <circle class="barra" cx="40" cy="40" r="34" :stroke-dasharray="traco" />
                </svg>
                <strong>{{ completo }}%</strong>
            </div>
            <div v-if="completo < 100">
                <strong>Seu perfil está quase pronto</strong>
                <p>Adicione uma foto para chegar a 100% e ganhar 50 XP.</p>
            </div>
            <div v-else>
                <strong>Perfil completo!</strong>
                <p>Você preencheu todas as informações</p>
            </div>
        </div>
    </section>
    <div class="duas-colunas">
        <section class="card edicao" aria-labelledby="t-edicao">
            <header class="card-cab">
                <h3 id="t-edicao">Edição do perfil</h3>
                <p>Atualize as informações exibidas para a comunidade</p>
            </header>

            <form class="form" @submit.prevent="salvar">
                <div class="campo">
                    <label for="nome">Nome completo</label>
                    <input id="nome" v-model="form.nome" type="text" required>
                </div>  

                <div class="campo">
                    <label for="publico">Nome público</label>
                     <input id="publico" v-model="form.nomePublico" type="text" />
                    <small>Usado no ranking e nas interações.</small>
                </div>

                <div class="campo">
                    <label for="email">E-mail institucional <span>Não editável</span></label>
                     <input id="email" :value="usuario.email" type="email" disabled />
                </div>

                <div class="campo">
                    <label for="matricula">Matrícula <span>Não editável</span></label>
                     <input id="matricula" :value="usuario.matricula" type="text" disabled />
                </div>

                <div class="campo">
                    <label for="curso">Curso</label>
                     <input id="curso" v-model="form.curso" type="text" />
                </div>
                <div class="campo">
                    <label for="local">Localização</label>
                    <input id="local" v-model="form.localizacao" type="text">
                </div>

                <div class="campo largo">
                    <label for="bio">Bio</label>
                    <input id="bio" v-model="form.bio" type="text" maxlength="160">
                    <small>{{ form.bio.length }} de 160 caracteres</small>
                </div>

                <div class="acoes largo">
                    <p v-if="salvo" role="status" class="ok">Perfil atualizado</p>
                    <button type="button" class="botao-sec" @click="cancelar" :disabled="!alterado">Cancelar</button>
                    <button type="submit" class="botao-pri" :disabled="!alterado || !valido">Salvar alterações</button>
                </div>
            </form>
        </section>

        <section class="card visibilidade" aria-labelledby="t-vis">
            <header class="card-cab">
                <h3 id="t-vis">Visibilidade</h3>
                <p>Controle como seu perfil aparece</p>
            </header>

            <div v-for="item in visibilidade" :key="item.chave" class="linha-vis">
                <div>
                    <strong :id="'v-' + item.chave">{{ item.titulo }}</strong>
                    <small>{{ item.descricao }}</small>
                </div>
                <Interruptor v-model="configuracoes[item.chave]" :rotulo-id="'v-' + item.chave"/>
            </div>

            <p class="aviso-info">ⓘ Seu e-mail e sua matrícula nunca ficam visíveis para outros usuários.</p>

        </section>
    </div>
</template>

<style scoped>
.titulo-pagina {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

.titulo-pagina h2 {
    margin: 0;
    font-size: 26px;
}

.titulo-pagina p,
.titulo-pagina small {
    margin: 4px 0 0; 
    color: var(--texto-suave);
}

.card {
    overflow: hidden;
    border: 1px solid var(--borda);
    border-radius: 16px;
    background: var(--superficie);
}

.identidade {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
}

.avatar-perfil {
    display: grid;
    place-items: center;
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22c55e, #0f7a3b);
    color: #fff;
    font-size: 30px;
   font-weight: 700; 
}

.selos {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 8px 0 0;
    padding: 0;
    list-style: none;
}

.selos li {
    padding: 4px 10px;
    border-radius: 8px;
    background: var(--verde-100);
    font-size: 12.5px;
}

.completude {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-left: auto;
    max-width: 320px;
}

.anel {
    position: relative;
    width: 80px;
    height: 80px;
    flex: none;
}

.anel strong {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
}

.trilha {
    fill: none;
    stroke: var(--verde-100);
    stroke-width: 6;
}

.barra {
    fill: none;
    stroke: var(--verde-700);
    stroke-width: 6;
    stroke-linecap: round;
    transform: rotate(-90deg);
    transform-origin: 40px 40px;
}

.duas-colunas {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: 24px;
    margin-top: 24px;
    align-items: start;
}

.card-cab {
    padding: 16px 20px;
    background: var(--fundo);
} 

.card-cab h3 {
    margin: 0;
    font-size: 15px;
}

.card-cab p {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--texto-suave);
}

.form {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px 20px;
    padding: 20px;
}

.largo { grid-column: 1 / -1; }

.campo label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 600;
}

.campo label span {
    font-weight: 400;
    font-size: 11.5px;
    color: var(--texto-suave);
}

.campo input {
    width: 100%;
    height: 40px;
    padding: 0 12px;
    box-sizing: border-box;
    border: 1px solid var(--borda);
    border-radius: 10px;
    background: var(--superficie);
    color: var(--texto);
    font: inherit;
    font-size: 14px;
}

.campo input:disabled {
    background: var(--fundo);
    color: var(--texto-suave);
    cursor: not-allowed;
}

.campo input:focus-visible {
    outline: 2px solid #1fe05a;
    outline-offset: 1px;
}

.campo small {
    display: block; 
    margin-top: 4px;
    font-size: 12px;
    color: var(--texto-suave);
}

.acoes {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
}

.ok {
    margin: 0 auto 0 0;
    color: var(--verde-700);
    font-size: 13px;
    font-weight: 600;
}

.botao-pri,
.botao-sec {
    height: 40px;
    padding: 0 18px;
    border-radius: 10px;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.botao-pri {
    border: 0;
    background: var(--verde-900);
    color: #fff;
}

.botao-sec {
    border: 1px solid var(--borda);
    background: var(--superficie);
    color: var(--texto);
}

.botao-pri:disabled,
.botao-sec:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

.linha-vis {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 12px 20px;
    border-top: 1px solid var(--borda);
}

.linha-vis strong {
    display: block;
    font-size: 14px;
}

.linha-vis small {
    display: block;
    margin-top: 2px;
    font-size: 12px;
    color: var(--texto-suave);
}

.aviso-info {
    margin: 0;
    padding: 12px 20px;
    background:#84abff61 ;
    color: #1E40AF;
    font-size: 12.5px;
}

@media (max-width: 900px) {
    .duas-colunas,
    .form {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>