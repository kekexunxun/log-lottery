<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { DialogTrigger, type DialogTriggerProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<DialogTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <DialogTrigger v-bind="delegatedProps" :class="cn('', props.class)">
    <slot />
  </DialogTrigger>
</template>
