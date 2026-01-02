<template>
  <div class="absolute right-0 bottom-1/2">
    <TooltipProvider>
      <Tooltip v-if="isSettingPage">
        <TooltipTrigger as-child>
          <div
            class="flex items-center justify-center w-10 h-10 p-0 m-0 cursor-pointer setting-container bg-slate-500/50 rounded-l-xl hover:bg-slate-500/80 hover:text-blue-400/90"
            @click="enterHome"
          >
            <HouseIcon />
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>回到首页</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip v-else>
        <TooltipTrigger as-child>
          <div
            class="flex items-center justify-center w-10 h-10 p-0 m-0 cursor-pointer setting-container bg-slate-500/50 rounded-l-xl hover:bg-slate-500/80 hover:text-blue-400/90"
            @click="enterConfig"
          >
            <SettingsIcon />
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>打开配置</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</template>

<script setup lang="ts">
import { HouseIcon, SettingsIcon } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()

const isSettingPage = computed(() => route.path.startsWith('/config'))

function enterConfig() {
  router.push('/config/person/all')
}
function enterHome() {
  router.push('/')
}
</script>
