<template>
  <Dialog :open="modelValue" @update:open="handleOpenUpdate">
    <DialogContent class="sm:max-w-125">
      <DialogTitle>{{ title }}</DialogTitle>
      <DialogDescription>{{ description }}</DialogDescription>

      <form class="space-y-4 mt-4" @submit="onSubmit">
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

        <FormField v-slot="{ value, handleChange }" name="isUsed">
          <FormItem class="grid grid-cols-4 items-center gap-4 space-y-0">
            <FormLabel class="text-right">已完成抽奖</FormLabel>
            <div class="col-span-3">
              <FormControl>
                <Checkbox :checked="value" @update:checked="handleChange" />
              </FormControl>
            </div>
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, handleChange }" name="separateCount">
          <FormItem>
            <FormControl>
              <PrizeSplitter :model-value="value" :total-count="values.count" @update:model-value="handleChange" />
            </FormControl>
          </FormItem>
        </FormField>

        <DialogFooter>
          <Button type="button" variant="outline" @click="handleCancel">取消</Button>
          <Button
            type="submit"
            :disabled="
              Number(totalSeparateCount) !== Number(values.count) ||
              (values.separateCount?.countList || []).some((s) => s.count > 10)
            "
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
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface Props {
  modelValue: boolean
  prize?: IPrizeConfig | null
  isTemporary?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isTemporary: false,
  prize: null
})

const emit = defineEmits(['update:modelValue', 'submit'])

const title = computed(() => {
  if (props.isTemporary) return '设置临时奖品'
  return props.prize ? '编辑奖品' : '添加奖品'
})

const description = computed(() => {
  if (props.isTemporary) return '设置临时活动的奖品信息'
  return props.prize ? '修改奖品配置信息' : '添加一个新的奖品配置'
})

const handleOpenUpdate = (value: boolean) => {
  emit('update:modelValue', value)
  if (value) {
    if (props.prize) {
      resetForm({
        values: JSON.parse(JSON.stringify(props.prize))
      })
    } else {
      resetForm({
        values: {
          id: new Date().getTime().toString(),
          name: '',
          count: 1,
          isAll: false,
          picture: { id: '', name: '', url: '' },
          separateCount: { enable: false, countList: [{ id: '1', count: 1, isUsedCount: 0 }] },
          isUsedCount: 0,
          isShow: true,
          frequency: 1,
          sort: 0,
          desc: '',
          isUsed: false
        } as IPrizeConfig
      })
    }
  }
}

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, '请输入奖品名称'),
    count: z.coerce.number().min(1, '中奖人数至少为1'),
    isAll: z.boolean().default(false),
    isUsed: z.boolean().default(false),
    picture: z.object({
      id: z.string().min(1, '请选择奖品图片'),
      name: z.string(),
      url: z.string()
    })
  })
)

const { handleSubmit, values, resetForm, setFieldValue } = useForm<IPrizeConfig>({
  validationSchema: formSchema
})

const totalSeparateCount = computed(() => {
  return values.separateCount?.countList.reduce((acc, cur) => acc + cur.count, 0) || 0
})

watch(
  () => values.count,
  (newCount) => {
    if (newCount && newCount > 0) {
      if (values.isUsed) {
        setFieldValue('isUsedCount', newCount)
      }
    }
  }
)

watch(
  () => values.isUsed,
  (newVal) => {
    if (newVal) {
      setFieldValue('isUsedCount', values.count)
    } else {
      setFieldValue('isUsedCount', 0)
    }
  }
)

const onSubmit = handleSubmit(
  (values) => {
    console.log('Form submitted successfully:', values)
    emit('submit', { ...values, isShow: props.isTemporary })
    emit('update:modelValue', false)
  },
  ({ errors }) => {
    console.error('Form validation failed:', errors)
  }
)

const handleCancel = () => {
  emit('update:modelValue', false)
}
</script>
