<template>
  <div class="flex items-center">
    <PrizeDialog v-model="isDialogOpen" is-temporary :prize="temporaryPrize" @submit="handleDialogSubmit" />

    <div
      class="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex items-center transition-transform duration-500 ease-in-out"
      :class="prizeShow ? 'translate-x-0' : '-translate-x-[calc(100%-24px)]'"
    >
      <div class="flex items-center">
        <div
          class="flex flex-col gap-2 p-2 rounded-r-xl bg-slate-800/40 backdrop-blur-md border-y border-r border-white/10 shadow-2xl"
        >
          <!-- 临时奖品 -->
          <div v-if="temporaryPrize.isShow && !temporaryPrize.isUsed" class="mb-2">
            <div :class="currentPrize.id === temporaryPrize.id ? 'current-prize' : ''" class="w-fit">
              <Card class="h-20 w-72 bg-orange-500/10 border-orange-500/30">
                <div
                  class="relative flex flex-row items-center justify-between w-full h-full"
                  :class="{ 'grayscale-[0.8] opacity-60': temporaryPrize.isUsed }"
                >
                  <div
                    v-if="temporaryPrize.isUsed"
                    class="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center"
                  >
                    <div
                      class="border-2 border-red-500/80 text-red-500/90 px-2 py-0.5 rounded-md font-bold text-sm uppercase tracking-[0.2em] -rotate-12 shadow-lg bg-black/20"
                    >
                      已结束
                    </div>
                  </div>
                  <figure class="ml-3 w-10 h-10 rounded-xl overflow-hidden shadow-inner bg-black/20">
                    <img
                      :src="temporaryPrize.picture.url || defaultPrizeImage"
                      alt="奖品"
                      class="object-cover h-full w-full rounded-xl"
                    />
                  </figure>
                  <CardContent class="flex-1 p-2 text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <h2
                            class="text-base font-semibold overflow-hidden whitespace-nowrap text-ellipsis text-orange-200"
                          >
                            {{ temporaryPrize.name }}
                          </h2>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{{ temporaryPrize.name }} (临时)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <p class="text-sm text-orange-300/70 mt-1">
                      {{ temporaryPrize.isUsedCount }}/{{ temporaryPrize.count }}
                    </p>
                    <div class="w-full h-1.5 mt-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-orange-500 transition-all duration-300"
                        :style="`width: ${(temporaryPrize.isUsedCount / temporaryPrize.count) * 100}%`"
                      />
                    </div>
                  </CardContent>
                  <div class="flex flex-col gap-1 mr-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-7 w-7 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20"
                      @click="addTemporaryPrize"
                    >
                      <EditIcon class="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      @click="deleteTemporaryPrize"
                    >
                      <Trash2Icon class="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
            <div class="h-px bg-white/10 my-2 mx-2"></div>
          </div>

          <!-- 奖品列表 -->
          <ul
            v-else
            ref="scrollContainer"
            class="flex flex-col gap-2 max-h-[440px] overflow-y-auto scroll-smooth pr-1 scrollbar-hide"
          >
            <li
              v-for="item in localPrizeList"
              :key="item.id"
              :ref="
                (el) => {
                  if (item.id === currentPrize.id) currentPrizeRef = el as any
                }
              "
              :class="[currentPrize.id === item.id ? 'current-prize' : '', !item.isShow ? 'hidden' : '']"
            >
              <Card class="w-64 h-20 bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                <div
                  class="relative flex flex-row items-center justify-between w-full h-full"
                  :class="{ 'grayscale-[0.8] opacity-60': item.isUsed }"
                >
                  <div
                    v-if="item.isUsed"
                    class="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center"
                  >
                    <div
                      class="border-2 border-red-500/80 text-red-500/90 px-2 py-0.5 rounded-md font-bold text-sm uppercase tracking-[0.2em] -rotate-12 shadow-lg bg-black/20"
                    >
                      已结束
                    </div>
                  </div>
                  <figure class="ml-3 w-10 h-10 rounded-xl overflow-hidden shadow-inner bg-black/20">
                    <img :src="item.picture.url || defaultPrizeImage" alt="奖品" class="object-cover h-full w-full" />
                  </figure>
                  <CardContent class="flex-1 p-2 text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <h2 class="text-base font-semibold overflow-hidden whitespace-nowrap text-ellipsis">
                            {{ item.name }}
                          </h2>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{{ item.name }}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <p class="text-sm text-gray-400 mt-1">{{ item.isUsedCount }}/{{ item.count }}</p>
                    <div class="w-full h-1.5 mt-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-primary transition-all duration-300"
                        :style="`width: ${(item.isUsedCount / item.count) * 100}%`"
                      />
                    </div>
                  </CardContent>
                </div>
              </Card>
            </li>
          </ul>

          <!-- 底部控制按钮 -->
          <div class="flex items-center justify-between px-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    v-show="!temporaryPrize.isShow"
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
                    @click="addTemporaryPrize"
                  >
                    <PlusIcon class="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>添加临时抽奖活动</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10"
                    @click="prizeShow = !prizeShow"
                  >
                    <ArrowLeftIcon class="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>隐藏列表</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <!-- 展开按钮 -->
        <div v-if="!prizeShow" class="ml-0.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  class="w-6 h-12 rounded-r-lg bg-slate-800/40 backdrop-blur-md border-y border-r border-white/10 text-white/50 hover:text-white hover:bg-white/20 transition-all"
                  @click="prizeShow = !prizeShow"
                >
                  <ArrowRightIcon class="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>展开奖品列表</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { usePriceStore, useConfigStore } from '@/store'
import defaultPrizeImage from '@/assets/images/龙.png'
import PrizeDialog from '@/components/PrizeDialog.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ArrowLeftIcon, ArrowRightIcon, EditIcon, PlusIcon, Trash2Icon } from 'lucide-vue-next'

const prizeStore = usePriceStore()
const configStore = useConfigStore()
const { prizeList: localPrizeList, currentPrize, temporaryPrize } = storeToRefs(prizeStore)

const scrollContainer = ref<HTMLElement | null>(null)
const currentPrizeRef = ref<HTMLElement | null>(null)

// 控制显示状态
const prizeShow = ref(false)

const isDialogOpen = ref(false)
function addTemporaryPrize() {
  isDialogOpen.value = true
}

function handleDialogSubmit(values: any) {
  prizeStore.setTemporaryPrize({
    ...values,
    count: Number(values.count)
  })
}

function deleteTemporaryPrize() {
  temporaryPrize.value.isShow = false
  prizeStore.setTemporaryPrize(temporaryPrize.value)
}

// 自动滚动到当前奖项
const scrollToCurrent = () => {
  nextTick(() => {
    if (currentPrizeRef.value && scrollContainer.value) {
      const container = scrollContainer.value
      const element = currentPrizeRef.value
      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()

      if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  })
}

watch(
  () => [temporaryPrize.value.isShow, temporaryPrize.value.isUsed],
  () => {
    setCurrentPrize()
  }
)

watch(
  () => currentPrize.value.id,
  () => {
    scrollToCurrent()
  }
)

watch(
  () => configStore.isShowPrizeList,
  (val) => {
    prizeShow.value = val
  }
)

onMounted(() => {
  prizeShow.value = configStore.isShowPrizeList
  setCurrentPrize()
  setTimeout(scrollToCurrent, 500)
})

function setCurrentPrize() {
  if (temporaryPrize.value.isShow && !temporaryPrize.value.isUsed) {
    prizeStore.setCurrentPrize(temporaryPrize.value)
    return
  }
  for (let i = 0; i < localPrizeList.value.length; i++) {
    if (localPrizeList.value[i].isUsedCount < localPrizeList.value[i].count) {
      prizeStore.setCurrentPrize(localPrizeList.value[i])
      return
    }
  }
}
</script>

<style lang="scss" scoped>
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }
}

.current-prize {
  position: relative;
  display: block;
  padding: 3px;
  overflow: hidden;
  isolation: isolate;
  border-radius: 15px;
}

.current-prize::before {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -2;
  width: 400%;
  height: 100%;
  content: '';
  background: linear-gradient(115deg, #4fcf70, #fad648, #a767e5, #12bcfe, #44ce7b);
  background-size: 25% 100%;
  animation: border-rotate 1.5s linear infinite;
}

.current-prize::after {
  position: absolute;
  inset: 2px;
  z-index: -1;
  content: '';
  background: oklch(0.205 0 0deg);
  border-radius: 13px;
}

@keyframes border-rotate {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-25%);
  }
}
</style>
