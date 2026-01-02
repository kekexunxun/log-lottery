<template>
  <Dialog :open="modelValue" @update:open="handleOpenUpdate">
    <DialogContent class="sm:max-w-125">
      <DialogTitle>添加临时奖品</DialogTitle>
      <DialogDescription>设置临时活动的奖品信息</DialogDescription>

      <form @submit="onSubmit" class="space-y-4 mt-4">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem class="grid grid-cols-4 items-center gap-4 space-y-0">
            <FormLabel class="text-right">奖品名称</FormLabel>
            <div class="col-span-3">
              <FormControl>
                <Input v-bind="componentField" placeholder="请输入奖品名称" />
              </FormControl>
              <FormMessage />
            </div>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="count">
          <FormItem class="grid grid-cols-4 items-center gap-4 space-y-0">
            <FormLabel class="text-right">中奖人数</FormLabel>
            <div class="col-span-3">
              <FormControl>
                <Input v-bind="componentField" type="number" placeholder="请输入中奖人数" />
              </FormControl>
              <FormMessage />
            </div>
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, handleChange }" name="picture">
          <FormItem class="grid grid-cols-4 items-center gap-4 space-y-0">
            <FormLabel class="text-right">奖品图片</FormLabel>
            <div class="col-span-3">
              <FormControl>
                <PictureSelector :model-value="value?.id" @change="handleChange" />
              </FormControl>
              <FormMessage />
            </div>
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, handleChange }" name="isAll">
          <FormItem class="grid grid-cols-4 items-center gap-4 space-y-0">
            <FormLabel class="text-right">全员参与</FormLabel>
            <div class="col-span-3">
              <FormControl>
                <Checkbox :checked="value" @update:checked="handleChange" />
              </FormControl>
            </div>
          </FormItem>
        </FormField>

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
                v-for="item in values.count"
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
                    item === values.count ? 'bg-primary h-8 w-0.5' : ''
                  ]"
                />

                <!-- 提示切割 -->
                <div
                  v-if="item < values.count"
                  class="absolute -bottom-4 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] text-primary whitespace-nowrap font-medium"
                >
                  {{ scaleList.includes(item) ? '合并' : '切割' }}
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <div
                v-for="se in values.separateCount.countList"
                :key="se.id"
                class="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-md text-sm font-medium border border-blue-500/20"
                :class="se.count > 10 ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''"
              >
                {{ se.count }}人
              </div>
            </div>

            <div v-if="values.separateCount.countList.some((s) => s.count > 10)" class="text-xs text-red-500">
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
                  <span
                    ><strong>切割：</strong>点击上方刻度尺中<span class="text-slate-300">灰色数字</span
                    >，可在此处将抽取轮次切开。</span
                  >
                </li>
                <li class="flex items-start gap-1.5">
                  <span class="text-primary mt-0.5">•</span>
                  <span
                    ><strong>合并：</strong>点击刻度尺中已高亮的<span class="text-primary">彩色数字</span
                    >，可取消该切割点并合并前后轮次。</span
                  >
                </li>
                <li class="flex items-start gap-1.5">
                  <span class="text-primary mt-0.5">•</span>
                  <span><strong>规则：</strong>系统默认按每轮 10 人自动拆分，你也可以通过点击刻度进行个性化调整。</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="handleCancel">取消</Button>
          <Button
            type="submit"
            :disabled="totalSeparateCount !== values.count || values.separateCount.countList.some((s) => s.count > 10)"
          >
            确认
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { computed, watch } from 'vue'
import type { IPrizeConfig } from '@/types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { usePriceStore } from '@/store'

const modelValue = defineModel<boolean>()

const handleOpenUpdate = (value: boolean) => {
  modelValue.value = value
  if (value && prizeStore.temporaryPrize.isShow) {
    const temp = prizeStore.temporaryPrize
    resetForm({
      values: {
        ...temp,
        count: temp.count
      }
    })
  } else if (!value) {
    resetForm({
      values: {
        name: '',
        count: 1,
        isAll: false,
        picture: { id: '', name: '', url: '' },
        separateCount: { enable: true, countList: [{ id: '1', count: 1, isUsedCount: 0 }] }
      }
    })
  }
}
const prizeStore = usePriceStore()

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, '请输入奖品名称'),
    count: z.coerce.number().min(1, '中奖人数至少为1'),
    isAll: z.boolean().default(false),
    picture: z.object({
      id: z.string().min(1, '请选择奖品图片'),
      name: z.string(),
      url: z.string()
    }),
    separateCount: z
      .object({
        enable: z.boolean(),
        countList: z.array(
          z.object({
            id: z.string(),
            count: z.number().min(1),
            isUsedCount: z.number().default(0)
          })
        )
      })
      .optional()
  })
)

const { handleSubmit, values, resetForm, setFieldValue } = useForm<IPrizeConfig>({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    count: 1,
    isAll: false,
    picture: { id: '', name: '', url: '' },
    separateCount: { enable: true, countList: [{ id: '1', count: 1, isUsedCount: 0 }] },
    isUsedCount: 0,
    isShow: true,
    frequency: 1
  }
})

const totalSeparateCount = computed(() => {
  return values.separateCount?.countList.reduce((acc, cur) => acc + cur.count, 0) || 0
})

const scaleList = computed(() => {
  const list = [0]
  let current = 0
  values.separateCount?.countList.forEach((item) => {
    current += item.count
    list.push(current)
  })
  return list
})

const editScale = (val: number) => {
  if (val === 0 || val === values.count) return

  const currentScales = [...scaleList.value]
  const index = currentScales.indexOf(val)

  if (index !== -1) {
    // 如果已经存在，则删除该切割点（合并）
    currentScales.splice(index, 1)
  } else {
    // 如果不存在，则添加切割点
    currentScales.push(val)
    currentScales.sort((a, b) => a - b)
  }

  // 根据新的切割点重建 countList
  const newCountList = []
  for (let i = 0; i < currentScales.length - 1; i++) {
    newCountList.push({
      id: (i + 1).toString(),
      count: currentScales[i + 1] - currentScales[i],
      isUsedCount: 0
    })
  }
  setFieldValue('separateCount.countList', newCountList)
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
  setFieldValue('separateCount.countList', countList)
}

watch(
  () => values.count,
  (newCount) => {
    if (newCount > 0) {
      autoSplit(newCount)
    }
  }
)

// const addRound = () => {
//   const currentTotal = totalSeparateCount.value
//   const remaining = values.count - currentTotal
//   if (remaining <= 0) return

//   const count = Math.min(remaining, 10)
//   const newList = [
//     ...(values.separateCount?.countList || []),
//     {
//       id: (values.separateCount?.countList.length! + 1).toString(),
//       count,
//       isUsedCount: 0
//     }
//   ]
//   setFieldValue('separateCount.countList', newList)
// }

// const removeRound = (index: number) => {
//   const newList = [...(values.separateCount?.countList || [])]
//   newList.splice(index, 1)
//   setFieldValue('separateCount.countList', newList)
// }

// const updateRoundCount = (index: number, newCount: number) => {
//   const newList = [...(values.separateCount?.countList || [])]
//   if (isNaN(newCount) || newCount < 1) {
//     newCount = 1
//   }
//   const val = Math.min(newCount, 10)
//   newList[index] = { ...newList[index], count: val }
//   setFieldValue('separateCount.countList', newList)
// }

const onSubmit = handleSubmit((values) => {
  prizeStore.setTemporaryPrize({
    ...values,
    count: Number(values.count)
  })

  modelValue.value = false
})

const handleCancel = () => {
  modelValue.value = false
}
</script>
