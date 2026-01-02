<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { CollapsibleTrigger, type CollapsibleTriggerProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<CollapsibleTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <CollapsibleTrigger
    v-bind="delegatedProps"
    :class="cn('', props.class)"
  >
    <slot />
  </CollapsibleTrigger>
</template>
