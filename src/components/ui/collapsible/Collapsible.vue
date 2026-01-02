<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import {
  CollapsibleRoot,
  type CollapsibleRootEmits,
  type CollapsibleRootProps,
  useForwardPropsEmits,
} from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<CollapsibleRootProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<CollapsibleRootEmits>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <CollapsibleRoot
    v-bind="forwarded"
    :class="cn('', props.class)"
  >
    <slot />
  </CollapsibleRoot>
</template>
