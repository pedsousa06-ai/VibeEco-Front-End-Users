<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { buscarPostPorId, criaComentario } from '@/services/feed'
import { usuario } from '@/services/usuario'
import Icone from '@/components/Icone.vue'

const route = useRoute()
const router = useRouter()

const post = ref(null)
const carregando = ref(true)
const erro = ref('')

// Controle do novo comentário
const textoComentario = ref('')
const enviando = ref(false)

async function carregarPost() {
    try {
        carregando.value = true
        erro.value = ''
        
        const p = await buscarPostPorId(route.params.id)
        post.value = p
        
    } catch (e) {
        erro.value = e.message
    } finally {
        carregando.value = false
    }
}

// <-- FUNÇÃO PARA ANIMAR A CURTIDA
function curtir() {
    if (!post.value) return
    post.value.curtiu = !post.value.curtiu
    if (post.value.curtiu) {
        post.value.curtidas++
    } else {
        post.value.curtidas--
    }
}

async function enviarComentario() {
    if (!textoComentario.value.trim()) return
    enviando.value = true
    
    try {
        await criaComentario({
            idPost: post.value.id,
            idUsuario: usuario.id,
            comentario: textoComentario.value
        })
        
        textoComentario.value = ''
        await carregarPost() // Recarrega o post para atualizar os comentários
        
    } catch (e) {
        alert('Erro ao enviar comentário: ' + e.message)
    } finally {
        enviando.value = false
    }
}

onMounted(carregarPost)
</script>

<template>
    <div class="detalhe-container">
        <button class="btn-voltar" @click="router.back()">
            <Icone nome="seta-esquerda" :tamanho="16" />← Voltar
        </button>

        <p v-if="carregando" class="aviso">Carregando post...</p>
        <p v-else-if="erro" class="aviso erro">{{ erro }}</p>

        <div v-else-if="post" class="conteudo">
            <!-- CARD DO POST -->
            <article class="card post">
                <header class="post-topo">
                    <span class="avatar">{{ post.iniciais }}</span>
                    <div class="post-autor">
                        <strong>{{ post.autor }}</strong>
                        <small>{{ post.tempo }}</small>
                    </div>
                    <span v-if="post.categoria" class="selo">{{ post.categoria }}</span>
                </header>

                <p class="post-texto">{{ post.texto }}</p>

                <img v-if="post.imagem" class="post-imagem" :src="post.imagem" alt="Imagem do post">
                
                <!-- BOTÃO DE CURTIR ANIMADO -->
                <div class="post-acoes">
                    <button type="button" class="btn-curtir" :class="{ 'curtido': post.curtiu }" @click="curtir">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z" />
                        </svg>
                        <span>{{ post.curtidas }} curtidas</span>
                    </button>
                </div>
            </article>

            <!-- SEÇÃO DE COMENTÁRIOS -->
            <div class="card comentarios-bloco">
                <h3>Comentários ({{ post.comentarios }})</h3>
                
                <!-- Lista de comentários -->
                <div class="lista">
                    <div v-for="c in post.listaComentarios" :key="c.id" class="comentario">
                        <span class="avatar pequeno">{{ c.iniciais }}</span>
                        <div class="comentario-texto">
                            <strong>{{ c.autor }}</strong>
                            <p>{{ c.texto }}</p>
                        </div>
                    </div>
                    <p v-if="post.comentarios === 0" class="vazio">Nenhum comentário ainda. Seja o primeiro!</p>
                </div>

                <!-- Caixa de novo comentário -->
                <div class="compor-comentario">
                    <span class="avatar pequeno">{{ usuario.iniciais }}</span>
                    <input 
                        type="text" 
                        v-model="textoComentario" 
                        placeholder="Escreva um comentário..." 
                        @keyup.enter="enviarComentario"
                    >
                    <button 
                        class="botao" 
                        @click="enviarComentario" 
                        :disabled="enviando || !textoComentario.trim()"
                    >
                        {{ enviando ? '...' : 'Enviar' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.detalhe-container {
    max-width: 680px;
    margin: 0 auto;
    display: grid;
    gap: 16px;
}

.btn-voltar {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: var(--texto-suave);
    font: inherit;
    font-size: 14px;
    cursor: pointer;
    padding: 0;
}

.btn-voltar:hover {
    color: var(--verde-forte);
}

.card {
    border: 1px solid var(--borda);
    border-radius: 16px;
    background: var(--superficie);
    box-shadow: 0 1px 2px rgba(18, 38, 26, 0.04);
}

.post {
    padding: 20px;
}

.post-topo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.avatar {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22c55e, #0f7a3b);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
}
.avatar.pequeno {
    width: 32px;
    height: 32px;
    font-size: 12px;
}

.post-autor strong {
    display: block;
    font-size: 15px;
}
.post-autor small {
    font-size: 13px;
    color: var(--texto-suave);
}

.selo {
    margin-left: auto;
    padding: 4px 12px;
    border-radius: 99px;
    background: var(--amarelo-fundo);
    color: var(--amarelo-texto);
    font-size: 12px;
    font-weight: 600;
}

.post-texto {
    margin: 0 0 16px;
    font-size: 15px;
    line-height: 1.6;
    white-space: pre-line;
}

.post-imagem {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    border-radius: 12px;
    margin-bottom: 16px;
}

/* --- ANIMAÇÃO DO BOTÃO DE CURTIR --- */
.post-acoes {
    display: flex;
    gap: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--borda);
}

.btn-curtir {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: none;
    padding: 0;
    color: var(--texto-suave);
    font: inherit;
    font-size: 14px;
    cursor: pointer;
    transition: color 0.2s;
}

.btn-curtir svg {
    fill: transparent;
    transition: fill 0.2s, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn-curtir:hover svg {
    transform: scale(1.1);
}

.btn-curtir.curtido {
    color: #e11d48;
}

.btn-curtir.curtido svg {
    fill: #e11d48;
    animation: pop 0.3s ease-out;
}

@keyframes pop {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
}

/* COMENTÁRIOS */
.comentarios-bloco {
    padding: 20px;
}

.comentarios-bloco h3 {
    margin: 0 0 16px;
    font-size: 15px;
    font-weight: 700;
}

.lista {
    display: grid;
    gap: 16px;
    margin-bottom: 20px;
}

.comentario {
    display: flex;
    gap: 12px;
    align-items: flex-start;
}

.comentario-texto strong {
    display: block;
    font-size: 13px;
    margin-bottom: 2px;
}

.comentario-texto p {
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
}

.vazio {
    margin: 0;
    color: var(--texto-suave);
    font-size: 14px;
}

.compor-comentario {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid var(--borda);
}

.compor-comentario input {
    flex: 1;
    height: 40px;
    padding: 0 14px;
    border: 1px solid var(--borda);
    border-radius: 10px;
    background: var(--fundo);
    font: inherit;
    font-size: 14px;
    color: var(--texto);
}

.botao {
    height: 40px;
    padding: 0 20px;
    border: 0;
    border-radius: 10px;
    background: var(--verde-900);
    color: #fff;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
}

.botao:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.aviso {
    text-align: center;
    padding: 40px;
    color: var(--texto-suave);
}
.aviso.erro {
    color: var(--erro-texto);
}

.conteudo {
    display: grid;
    gap: 16px;
}
</style>