<script setup>
import { usuario } from '@/services/usuario'; 
</script>

<template>
    <div>
        <h2>Dados e progresso do perfil</h2>
        <p>{{ usuario.nome }}</p>
    </div>
</template>

<style scoped>
</style>