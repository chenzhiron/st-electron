<script setup lang="ts">
import { onMounted, ref } from 'vue'
const data = ref('')
onMounted(() => {
  setTimeout(() => {
    data.value = 'http://127.0.0.1:9091'
  }, 1000)
  window.electron.ipcRenderer.on('shell_error', (event, arg) => {
    alert('脚本执行错误，错误信息：' + arg)
    alert('关闭程序，重新打开')
  })
  window.electron.ipcRenderer.on('shell_close', (event, arg) => {
    alert('脚本已关闭；状态码：' + arg)
    alert('重新启动程序')
  })
})
</script>

<template>
  <iframe :src="data" frameborder="0" style="width: 100vw; height: 100vh;"></iframe>
</template>
