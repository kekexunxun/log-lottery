<template>
  <RouterView />
  <AppSetting />
  <Toaster position="top-right" />
</template>

<script setup lang="ts">
import { usePriceStore } from '@/store'
import { onMounted } from 'vue'
import { Toaster } from '@/components/ui/sonner'
import { useColorMode } from '@vueuse/core'
import 'vue-sonner/style.css'

const priceStore = usePriceStore()

// 设置当前奖列表
function setCurrentPrize() {
  if (priceStore.prizeList.length <= 0) {
    return
  }
  for (let i = 0; i < priceStore.prizeList.length; i++) {
    if (!priceStore.prizeList[i].isUsed) {
      priceStore.setCurrentPrize(priceStore.prizeList[i])
      break
    }
  }
}

const mode = useColorMode()
onMounted(() => {
  setCurrentPrize()
  mode.value = 'dark'
})
</script>
