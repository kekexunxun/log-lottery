<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { CollapsibleContent, type CollapsibleContentProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<CollapsibleContentProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <CollapsibleContent
    v-bind="delegatedProps"
    :class="cn('overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down', props.class)"
  >
    <slot />
  </CollapsibleContent>
</template>
