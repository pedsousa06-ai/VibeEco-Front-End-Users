<script setup>
import { onMounted, ref } from 'vue';
import Icone from '@/components/Icone.vue';
import NovaPublicacaoModal from '@/components/NovaPublicacaoModal.vue'
import { criaPost, listarPostsRecentes } from '@/services/feed';
import { usuario } from '@/services/usuario';

const posts = ref([])
const carregando = ref(true)
const erroFeed = ref('')

// TODO: preencher com as categorias da API ([{ id, nome }]) quando existir uma rota que as liste
const categoriasPost = []

const modalAberto = ref(false)
const enviando = ref(false)
const erroPublicar = ref('')

async function carregar() {
    erroFeed.value = ''
    try{
        posts.value = await listarPostsRecentes()
    } catch (e) {
        erroFeed.value = e.message
    } finally {
        carregando.value = false
    }
}

function abrirModal(){
    erroPublicar.value = ''
    modalAberto.value = true
}

async function publicar({ texto, categoria, foto}) {
    enviando.value = true
    erroPublicar.value = ''
    try{
        await criaPost({ texto, categoriaId: categoria, foto, idUsuario: usuario.id })
        modalAberto.value = false
        await carregar()
    } catch (e) {
        erroPublicar.value = e.message
    } finally {
        enviando.value = false
    }
}

onMounted(carregar)

// TODO: ranking e desafios ainda não têm endpont no back-end 
const ranking = [
    { id: 1, nome: 'Carlos Mendes', iniciais: 'CM', xp: 4200, medalha: '🥇'},
    { id: 2, nome: 'Fernanda Lima', iniciais: 'FL', xp: 3850, medalha: '🥈'},
    { id: 3, nome: 'Rafael Costa', iniciais: 'RC', xp: 3600, medalha: '🥈'},
    { id: 4, nome: 'Ana Beatriz', iniciais: 'AB', xp: 3100, medalha: '#4'},
    { id: 5, nome: 'Lucas Nunes', iniciais: 'LN', xp: 2750, medalha: '#5'}
]
const desafios = [
    { id: 1, titulo: 'Semana sem Carro', detalhe: '234 participantes · 4 dias' },
    { id: 2, titulo: 'Desafio da Água', detalhe: '412 participantes · 1 dias' },
    { id: 3, titulo: 'Adote uma Área Verde', detalhe: '156 participantes · 8 dias' }
]
</script>

<template>
    <div class="feed">
        <div class="principal">
            <!-- CAIXA DE NOVA PUBLICAÇÃO -->
             <div class="card compor">
                <span class="avatar" aria-hidden="true">{{ usuario.iniciais }}</span>
                <button type="button" class="campo" @click="abrirModal">
                    Compartilhe sua conquista ou experiência... 
                </button>
                <button type="button" class="botao" @click="abrirModal">Publicar</button>
             </div>

             <p v-if="carregando" class="aviso">Carregando publicações...</p>

             <div v-else-if="erroFeed" class="aviso erro" role="alert">
                <p>{{ erroFeed }}</p>
                <button type="button" class="botao" @click="carregar">Tentar de novo</button>
             </div>

             <p v-else-if="!posts.length" class="aviso">Ainda não há publicações. Seja o primeiro a compartilhar!</p>

             <article v-for="post in posts" v-else :key="post.id" class="card post">
                <header class="post-topo">
                    <span class="avatar" aria-hidden="true">{{ post.iniciais }}</span>
                    <div class="post-autor">
                        <strong>{{ post.autor }}</strong>
                        <small>{{ post.tempo }}</small>
                    </div>
                    <span v-if="post.categoria" class="selo">
                        <Icone nome="medalha" :tamanho="13"/>{{ post.categoria }}
                    </span>
                </header>

                <p class="post-texto">{{ post.texto }}</p>

                <img v-if="post.imagem" class="post-imagem" :src="post.imagem" :alt="`Imagem da publicação de ${post.autor}`" loading="lazy">

                <footer class="post-rodape">
                  <span class="contagem">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z" />
                    </svg>
                     {{ post.curtidas }}
                    <span class="so-leitor">curtidas</span>
                    </span>
                     <span class="contagem">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                     <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
                    </svg>
                     {{ post.comentarios }}
                      <span class="so-leitor">comentários</span>
                    </span>
                </footer>
            </article>
        </div>

        <!-- COLUNA DA DIREITA -->
        <aside class="lateral" aria-label="Ranking e desafios">
          <section class="card bloco">
            <h3><span>Ranking da Semana</span><Icone nome="trofeu" :tamanho="16" class="icone-amarelo"/></h3>
            <ol class="ranking">
                <li v-for="item in ranking" :key="item.id">
                    <span class="posicao">{{ item.medalha }}</span>
                    <span class="avatar pequeno" aria-hidden="true">{{ item.iniciais }}</span>
                    <div>
                        <strong>{{ item.nome }}</strong>
                        <small>{{ item.xp.toLocaleString('pt-BR') }} XP</small>
                    </div>
                </li>
            </ol>
          </section>

          <section class="card bloco">
            <h3><span>Desafios Ativos</span></h3>
            <div v-for="d in desafios" :key="d.id" class="desafio">
                <strong>{{ d.titulo }}</strong>
                <small>{{ d.detalhe }}</small>
            </div>
          </section>
        </aside>

        <NovaPublicacaoModal
            v-if="modalAberto"
            :enviando="enviando"
            :erro="erroPublicar"
            :categorias="categoriasPost"
            @fechar="modalAberto = false"
            @publicar="publicar"
        />
    </div>
</template>

<style scoped>
.feed {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 24px;
  align-items: start;
}
.principal {
  display: grid;
  gap: 16px;
  min-width: 0;
}
 
.card {
  border: 1px solid var(--borda);
  border-radius: 16px;
  background: var(--superficie);
  box-shadow: 0 1px 2px rgba(18, 38, 26, 0.04);
}
.avatar {
  display: grid;
  place-items: center;
  flex: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #0f7a3b);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}
.avatar.pequeno {
  width: 30px;
  height: 30px;
  font-size: 11px;
}
 
/* compor */
.compor {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
}
.campo {
  flex: 1;
  min-width: 0;
  height: 40px;
  padding: 0 14px;
  border: 1px solid var(--borda);
  border-radius: 10px;
  background: var(--fundo);
  color: var(--texto-suave);
  font: inherit;
  font-size: 14px;
  text-align: left;
  cursor: text;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.campo:hover {
  border-color: var(--verde-600);
}
.botao {
  height: 40px;
  padding: 0 20px;
  border: 0;
  border-radius: 10px;
  background: var(--verde-900);
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.botao:hover {
  background: var(--verde-950);
}
.campo:focus-visible,
.botao:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
}
 
.aviso {
  display: grid;
  justify-items: center;
  gap: 12px;
  margin: 0;
  padding: 40px 24px;
  border: 1px dashed var(--borda);
  border-radius: 16px;
  background: #fff;
  text-align: center;
  color: var(--texto-suave);
}
.aviso p {
  margin: 0;
}
.aviso.erro {
  border-color: #f7caca;
  color: #b91c1c;
}
 
/* posts */
.post {
  display: grid;
  gap: 12px;
  padding: 16px;
}
.post-topo {
  display: flex;
  align-items: center;
  gap: 12px;
}
.post-autor strong {
  display: block;
  font-size: 14px;
}
.post-autor small {
  font-size: 12px;
  color: var(--texto-suave);
}
.selo {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: 3px 10px;
  border-radius: 99px;
  background: #fef3c7;
  color: #8a5a00;
  font-size: 12px;
  font-weight: 600;
}
.post-texto {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  white-space: pre-line;
  overflow-wrap: anywhere;
}
.post-imagem {
  display: block;
  width: 100%;
  max-height: 320px;
  object-fit: cover;
  border-radius: 12px;
  background: var(--fundo);
}
.post-rodape {
  display: flex;
  gap: 18px;
  color: var(--texto-suave);
  font-size: 13px;
}
.contagem {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.so-leitor {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
 
/* lateral */
.lateral {
  display: grid;
  gap: 16px;
}
.bloco {
  padding: 18px;
}
.bloco h3 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 700;
}
.icone-amarelo {
  color: #d97706;
}
.ranking {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.ranking li {
  display: flex;
  align-items: center;
  gap: 10px;
}
.posicao {
  width: 22px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--texto-suave);
}
.ranking strong {
  display: block;
  font-size: 13px;
}
.ranking small {
  font-size: 12px;
  color: var(--texto-suave);
}
.desafio {
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--fundo);
}
.desafio + .desafio {
  margin-top: 8px;
}
.desafio strong {
  display: block;
  font-size: 13.5px;
}
.desafio small {
  font-size: 12px;
  color: var(--texto-suave);
}
 
@media (max-width: 1100px) {
  .feed {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 520px) {
  .compor .botao {
    display: none;
  }
}
</style>