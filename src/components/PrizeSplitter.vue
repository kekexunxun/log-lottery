<template>
  <div class="grid grid-cols-4 gap-4 space-y-0">
    <div class="text-right">
      <Label class="mt-3">每次抽取人数</Label>
      <div class="text-[10px] text-muted-foreground mt-1">单次上限10人</div>
    </div>
    <div class="col-span-3 space-y-4">
      <div
        class="flex items-center justify-between px-2 py-6 bg-transparent dark:bg-input/30 border border-input rounded-md overflow-x-auto min-h-[100px]"
      >
        <div
          v-for="item in totalCount"
          :key="item"
          class="relative flex flex-col items-center flex-1 min-w-[20px] group cursor-pointer"
          @click="editScale(item)"
        >
          <!-- 刻度数字 -->
          <div
            class="absolute -top-6 text-[10px] transition-all group-hover:text-primary group-hover:font-bold group-hover:text-xs"
            :class="scaleList.includes(item) ? 'text-primary font-bold' : 'text-slate-500'"
          >
            {{ item }}
          </div>

          <!-- 刻度线 -->
          <div
            class="w-px h-6 transition-all"
            :class="[
              scaleList.includes(item) ? 'bg-primary h-8 w-0.5' : 'bg-slate-700 group-hover:bg-primary/50',
              item === totalCount ? 'bg-primary h-8 w-0.5' : ''
            ]"
          />

          <!-- 提示切割 -->
          <div
            v-if="item < totalCount"
            class="absolute -bottom-4 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] text-primary whitespace-nowrap font-medium"
          >
            {{ scaleList.includes(item) ? '合并' : '切割' }}
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <div
          v-for="se in modelValue?.countList"
          :key="se.id"
          class="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-md text-sm font-medium border border-blue-500/20"
          :class="se.count > 10 ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''"
        >
          {{ se.count }}人
        </div>
      </div>

      <div v-if="modelValue?.countList.some((s) => s.count > 10)" class="text-xs text-red-500">
        ⚠️ 存在单次超过 10 人的配置，请点击刻度进行切割
      </div>

      <!-- 操作说明 -->
      <div class="p-3 bg-transparent dark:bg-input/10 border border-input/50 rounded-md">
        <div class="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
          <div class="w-1 h-3 bg-primary rounded-full"></div>
          操作说明
        </div>
        <ul class="space-y-1 text-[10px] text-slate-500 leading-relaxed">
          <li class="flex items-start gap-1.5">
            <span class="text-primary mt-0.5">•</span>
            <span>
              <strong>切割：</strong>点击上方刻度尺中<span class="text-slate-300">灰色数字</span
              >，可在此处将抽取轮次切开。
            </span>
          </li>
          <li class="flex items-start gap-1.5">
            <span class="text-primary mt-0.5">•</span>
            <span>
              <strong>合并：</strong>点击刻度尺中已高亮的<span class="text-primary">彩色数字</span
              >，可取消该切割点并合并前后轮次。
            </span>
          </li>
          <li class="flex items-start gap-1.5">
            <span class="text-primary mt-0.5">•</span>
            <span><strong>规则：</strong>系统默认按每轮 10 人自动拆分，你也可以通过点击刻度进行个性化调整。</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { Label } from '@/components/ui/label'
import type { IPrizeConfig } from '@/types'

const props = withDefaults(
  defineProps<{
    modelValue?: IPrizeConfig['separateCount']
    totalCount: number
  }>(),
  { totalCount: 0 }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: IPrizeConfig['separateCount']): void
}>()

const scaleList = computed(() => {
  const list = [0]
  let current = 0
  props.modelValue?.countList.forEach((item) => {
    current += item.count
    list.push(current)
  })
  return list
})

const editScale = (val: number) => {
  if (val === 0 || val === (props.totalCount || 0)) return

  const currentScales = [...scaleList.value]
  const index = currentScales.indexOf(val)

  if (index !== -1) {
    currentScales.splice(index, 1)
  } else {
    currentScales.push(val)
    currentScales.sort((a, b) => a - b)
  }

  const newCountList = []
  for (let i = 0; i < currentScales.length - 1; i++) {
    newCountList.push({
      id: (i + 1).toString(),
      count: currentScales[i + 1] - currentScales[i],
      isUsedCount: 0
    })
  }

  emit('update:modelValue', {
    enable: true,
    countList: newCountList
  })
}

const autoSplit = (total: number) => {
  const countList = []
  let remaining = total
  let id = 1
  while (remaining > 0) {
    const count = Math.min(remaining, 10)
    countList.push({
      id: (id++).toString(),
      count,
      isUsedCount: 0
    })
    remaining -= count
  }
  emit('update:modelValue', {
    enable: false,
    countList: countList
  })
}

// 监听总人数变化，如果与当前分割总数不一致则自动重新分割
watch(
  () => props.totalCount,
  (newCount) => {
    const currentTotal = props.modelValue?.countList.reduce((acc, cur) => acc + cur.count, 0) || 0
    if (newCount > 0 && newCount !== currentTotal) {
      autoSplit(newCount)
    }
  },
  { immediate: true }
)
</script>
