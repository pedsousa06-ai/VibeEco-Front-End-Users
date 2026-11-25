<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Icone from '@/components/Icone.vue'

import {
  concluirConteudo,
  estiloCapa,
  obterConteudo
} from '@/services/conteudos'

import { usuario } from '@/services/usuario'
import { idDoUsuario } from '@/services/sessao'

const route = useRoute()
const router = useRouter()

const conteudo = ref(null)
const carregando = ref(true)
const concluindo = ref(false)
const erro = ref('')
const mensagem = ref('')

let inicioLeitura = null

const idUsuario = idDoUsuario()

function irParaLista() {
  router.push({ name: 'conteudos' })
}

function voltar() {
  irParaLista()
}

async function finalizarLeitura() {
  if (
    !conteudo.value ||
    conteudo.value.concluido ||
    concluindo.value ||
    !inicioLeitura
  ) {
    return
  }

  try {
    concluindo.value = true
    erro.value = ''
    mensagem.value = ''

    const tempoAcesso = Math.floor(
      (Date.now() - inicioLeitura) / 60000
    )

    const resultado = await concluirConteudo(
      conteudo.value.id,
      idUsuario,
      tempoAcesso
    )

    if (!resultado) {
      throw new Error('Não foi possível concluir a leitura.')
    }

    conteudo.value.concluido = true

    const xpGanho = Number(resultado.xpGanho) || 0

    if (xpGanho > 0) {
      if (typeof usuario.xp === 'number') {
        usuario.xp += xpGanho
      }

      if (typeof usuario.total_xp === 'number') {
        usuario.total_xp += xpGanho
      }

      mensagem.value = `Parabéns! Você ganhou ${xpGanho} XP!`
    } else {
      mensagem.value = 'Você já havia concluído este conteúdo.'
    }

  } catch (error) {
    console.error('Erro ao concluir conteúdo:', error)
    erro.value = error.message || 'Ocorreu um erro ao concluir a leitura.'
  } finally {
    concluindo.value = false
  }
}

onMounted(async () => {
  try {
    carregando.value = true
    erro.value = ''

    if (!idUsuario) {
      throw new Error('Não foi possível identificar o usuário logado.')
    }

    conteudo.value = await obterConteudo(
      route.params.id,
      idUsuario
    )

    if (!conteudo.value) {
      throw new Error('Não encontramos esse conteúdo.')
    }

    inicioLeitura = Date.now()

  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error)
    erro.value = error.message || 'Não foi possível carregar o conteúdo.'
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <section class="detalhe">

    <p v-if="carregando" class="aviso">
      Carregando conteúdo...
    </p>

    <div v-else-if="!conteudo" class="aviso">
      <p>{{ erro || 'Não encontramos esse conteúdo.' }}</p>

      <button
        type="button"
        class="botao"
        @click="irParaLista"
      >
        Voltar aos conteúdos
      </button>
    </div>

    <template v-else>

      <button
        type="button"
        class="voltar"
        @click="voltar"
      >
        ← Voltar aos conteúdos
      </button>

      <article class="painel">

        <div
          class="capa"
          :style="estiloCapa(conteudo)"
          role="img"
          :aria-label="conteudo.titulo"
        ></div>

        <div class="painel-corpo">

          <span class="tag">
            {{ conteudo.categoria }}
          </span>

          <h2>{{ conteudo.titulo }}</h2>

          <p class="meta">
            {{ conteudo.minutos }} min de leitura

            <span class="xp">
              <Icone
                nome="estrela"
                :tamanho="13"
                preenchido
              />
              {{ conteudo.xp }} XP
            </span>
          </p>

          <div class="divisor"></div>

          <h3>Conteúdo educativo</h3>

          <div class="descricao">
            {{ conteudo.descricao }}
          </div>

          <div
            v-if="conteudo.concluido"
            class="sucesso"
            role="status"
          >
            <Icone nome="check" :tamanho="16" />
            Você já concluiu esta leitura!
          </div>

          <button
            v-else
            type="button"
            class="botao grande"
            :disabled="concluindo"
            @click="finalizarLeitura"
          >
            {{
              concluindo
                ? 'Registrando conclusão...'
                : 'Concluir leitura e ganhar XP'
            }}
          </button>

          <p
            v-if="mensagem"
            class="sucesso"
            role="status"
          >
            {{ mensagem }}
          </p>

          <p
            v-if="erro"
            class="erro"
            role="alert"
          >
            {{ erro }}
          </p>

        </div>
      </article>

    </template>
  </section>
</template>

<style scoped>
.detalhe {
  display: grid;
  gap: 12px;
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}

.aviso {
  display: grid;
  justify-items: center;
  gap: 12px;
  margin: 0;
  padding: 48px 24px;
  border: 1px dashed var(--borda);
  border-radius: 16px;
  background: var(--superficie);
  text-align: center;
  color: var(--texto-suave);
}

.voltar {
  justify-self: start;
  padding: 4px 0;
  border: 0;
  background: none;
  color: var(--texto-suave);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.voltar:hover {
  color: var(--texto);
}

.voltar:focus-visible,
.botao:focus-visible {
  outline: 3px solid #1fe05a;
  outline-offset: 2px;
  border-radius: 8px;
}

.painel {
  overflow: hidden;
  border: 1px solid var(--borda);
  border-radius: 16px;
  background: var(--superficie);
  box-shadow: 0 1px 2px rgba(18, 38, 26, 0.04);
}

.painel-corpo {
  display: grid;
  gap: 12px;
  padding: 24px;
}

.painel-corpo h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.painel-corpo h3 {
  margin: 8px 0 0;
  font-size: 16px;
  font-weight: 700;
}

.capa {
  height: 190px;
  background-size: cover;
  background-position: center;
}

.tag {
  justify-self: start;
  padding: 3px 10px;
  border-radius: 99px;
  background: var(--verde-100);
  color: var(--verde-forte);
  font-size: 12px;
  font-weight: 600;
}

.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 13px;
  color: var(--texto-suave);
}

.xp {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--amarelo-texto);
  font-weight: 700;
}

.xp svg {
  color: #f5b301;
}

.divisor {
  height: 1px;
  margin: 4px 0;
  background: var(--borda);
}

.descricao {
  color: var(--texto-suave);
  font-size: 14.5px;
  line-height: 1.8;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.sucesso {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 12px;
  border: 1px solid var(--sucesso-broda);
  border-radius: 12px;
  background: var(--sucesso-fundo);
  color: var(--verde-forte);
  font-size: 14px;
  font-weight: 600;
}

.erro {
  margin: 0;
  color: var(--erro-texto);
  font-size: 14px;
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
  transition: background 0.15s;
}

.botao:hover {
  background: var(--verde-950);
}

.botao.grande {
  width: 100%;
  height: 46px;
  background: linear-gradient(
    90deg,
    var(--verde-700),
    var(--verde-600)
  );
}

.botao.grande:hover {
  background: linear-gradient(
    90deg,
    var(--verde-900),
    var(--verde-700)
  );
}

.botao:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
  .botao {
    transition: none;
  }
}
</style>