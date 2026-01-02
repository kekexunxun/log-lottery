<template>
  <Select :model-value="modelValue" @update:model-value="handleUpdate">
    <SelectTrigger>
      <div v-if="selectedImage" class="flex items-center gap-2">
        <img :src="selectedImage.url" class="w-6 h-6 rounded-xs" alt="Image" />
        <span class="text-xs">{{ selectedImage.name }}</span>
      </div>
      <SelectValue v-else :placeholder="placeholder" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="picItem in configStore.imageList" :key="picItem.id" :value="picItem.id">
        <div class="flex items-center gap-2">
          <img :src="picItem.url" class="w-6 h-6 rounded-xs" alt="Image" />
          <span class="text-xs">{{ picItem.name }}</span>
        </div>
      </SelectItem>
    </SelectContent>
  </Select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '@/store'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { IImage } from '@/types'

const props = defineProps<{
  modelValue?: string
  placeholder?: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', image: IImage): void
}>()

const configStore = useConfigStore()

const selectedImage = computed(() => {
  return configStore.imageList.find((pic) => pic.id === props.modelValue)
})

function handleUpdate(value: any) {
  const val = String(value)
  const img = configStore.imageList.find((pic) => pic.id === val)
  if (img) {
    emit('update:modelValue', val)
    emit('change', img)
  }
}
</script>
