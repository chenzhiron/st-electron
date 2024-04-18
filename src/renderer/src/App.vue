<script setup lang="ts">
import { onMounted, ref } from 'vue'
const data = ref('')
onMounted(() => {
  setTimeout(() => {
    data.value = 'http://127.0.0.1:9091'
  }, 1000)
})
</script>

<template>
  <iframe :src="data" frameborder="0" style="height: 100vh; width: 100vw"></iframe>
</template>
