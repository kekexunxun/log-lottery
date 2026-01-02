<template>
  <div class="w-full h-auto">
    <ul
      class="grid grid-rows-[repeat(7,1fr)] gap-px p-0 m-0 border border-black"
      :style="{ gridTemplateColumns: `repeat(${props.rowCount}, 20px)` }"
    >
      <li
        v-for="item in props.rowCount * 7"
        :key="item"
        class="w-5 h-5 cursor-pointer"
        :style="{ backgroundColor: patternList.includes(item) ? props.patternColor : props.cardColor }"
        @click.stop="updatePatternList(item)"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
interface Props {
  rowCount?: number
  cardColor?: string
  patternColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  rowCount: 17,
  cardColor: '#ffffff',
  patternColor: '#000'
})

const patternList = defineModel<number[]>('patternList', { default: () => [] })

function updatePatternList(item: number) {
  if (patternList.value.includes(item)) {
    patternList.value = patternList.value.filter((i) => i !== item)
  } else {
    patternList.value = [...patternList.value, item]
  }
}
</script>
