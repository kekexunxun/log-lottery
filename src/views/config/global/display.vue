<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">界面设置</h2>
    </div>

    <Dialog v-model:open="resetDialogOpen">
      <DialogTrigger as-child>
        <Button variant="destructive">重置所有数据</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>温馨提示</DialogTitle>
        <DialogDescription> 确认要重置所有数据吗？此操作不可恢复！ </DialogDescription>
        <DialogFooter>
          <Button variant="outline" @click="resetDialogOpen = false"> 取消 </Button>
          <Button variant="destructive" @click="resetData"> 确认 </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <div class="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>页面标题</CardTitle>
        </CardHeader>
        <CardContent>
          <Input v-model="topTitle" placeholder="请输入标题" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>卡片列数</CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <Input v-model.number="rowCount" type="number" placeholder="1-100" />
          <Button :disabled="isForceUpdateLayout !== 1" size="sm" @click="forceUpdateLayout">
            重设布局
            <span v-show="isForceUpdateLayout === 2" class="ml-2">⏳</span>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>背景图片</CardTitle>
        </CardHeader>
        <CardContent>
          <PictureSelector
            v-model="backgroundImage.id"
            placeholder="选择背景图片"
            @change="
              (img) => {
                backgroundImage = img
              }
            "
          />
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>卡片颜色</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex items-center gap-2">
            <Input v-model="cardColor" type="color" class="w-20 h-10 rounded" />
            <span class="text-xs">当前颜色：{{ cardColor }}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>中奖者颜色</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex items-center gap-2">
            <Input v-model="luckyCardColor" type="color" class="w-20 h-10 rounded" />
            <span class="text-xs">当前颜色：{{ luckyCardColor }}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>文字颜色</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex items-center gap-2">
            <Input v-model="textColor" type="color" class="w-20 h-10 rounded" />
            <span class="text-xs">当前颜色：{{ textColor }}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>高亮颜色</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex items-center gap-2">
            <Input v-model="patternColor" type="color" class="w-20 h-10 rounded" />
            <span class="text-xs">当前颜色：{{ patternColor }}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>卡片宽度 / 高度</CardTitle>
        </CardHeader>
        <CardContent class="flex gap-2">
          <Input v-model.number="cardWidth" type="number" placeholder="宽度" />
          <Input v-model.number="cardHeight" type="number" placeholder="高度" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>文字大小</CardTitle>
        </CardHeader>
        <CardContent>
          <Input v-model.number="textSize" type="number" placeholder="字体大小" />
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>图案设置</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <PatternSetting
          :row-count="rowCount"
          :card-color="cardColor"
          :pattern-color="patternColor"
          v-model:pattern-list="patternList"
        />
        <div class="flex gap-2">
          <Button variant="outline" @click="clearPattern"> 清空图案 </Button>
          <Button variant="outline" @click="resetPattern"> 默认图案 </Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>总是显示奖品列表</CardTitle>
      </CardHeader>
      <CardContent class="flex items-center space-x-2">
        <Checkbox id="show-prize" v-model="isShowPrizeList" />
        <Label for="show-prize"> 显示奖品列表 </Label>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>头像显示</CardTitle>
      </CardHeader>
      <CardContent class="flex items-center space-x-2">
        <Checkbox id="show-avatar" v-model="isShowAvatar" />
        <Label for="show-avatar"> 显示头像 </Label>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore, usePersonStore, usePriceStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import PictureSelector from '@/components/PictureSelector.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PatternSetting from './components/PatternSetting.vue'

const configStore = useConfigStore()
const personStore = usePersonStore()
const prizeStore = usePriceStore()

const { topTitle, rowCount, theme, isShowAvatar, isShowPrizeList } = storeToRefs(configStore)

const cardColor = computed({
  get: () => theme.value.cardColor,
  set: (val) => (theme.value.cardColor = val)
})
const luckyCardColor = computed({
  get: () => theme.value.luckyCardColor,
  set: (val) => (theme.value.luckyCardColor = val)
})
const textColor = computed({
  get: () => theme.value.textColor,
  set: (val) => (theme.value.textColor = val)
})
const cardWidth = computed({
  get: () => theme.value.cardWidth,
  set: (val) => (theme.value.cardWidth = val)
})
const cardHeight = computed({
  get: () => theme.value.cardHeight,
  set: (val) => (theme.value.cardHeight = val)
})
const textSize = computed({
  get: () => theme.value.textSize,
  set: (val) => (theme.value.textSize = val)
})
const patternColor = computed({
  get: () => theme.value.patternColor,
  set: (val) => (theme.value.patternColor = val)
})
const backgroundImage = computed({
  get: () => theme.value.background,
  set: (val) => (theme.value.background = val)
})
const patternList = computed({
  get: () => theme.value.patternList,
  set: (val) => (theme.value.patternList = val)
})

const alreadyPersonList = computed(() => personStore.getAlreadyPersonList())
const notPersonList = computed(() => personStore.getNotPersonList())

const resetDialogOpen = ref(false)

// 强制更新布局
const isForceUpdateLayout = ref(0)
function forceUpdateLayout() {
  isForceUpdateLayout.value = 2
  setTimeout(() => {
    const alreadyLen = alreadyPersonList.value.length
    const notLen = notPersonList.value.length
    if (alreadyLen <= 0 && notLen <= 0) return

    const allPersonList = alreadyPersonList.value.concat(notPersonList.value)
    const newAlreadyPersonList = allPersonList.slice(0, alreadyLen)
    const newNotPersonList = allPersonList.slice(alreadyLen, notLen + alreadyLen)

    personStore.deleteAllPerson()
    personStore.addNotPersonList(newNotPersonList)
    personStore.addAlreadyPersonList(newAlreadyPersonList, null)

    isForceUpdateLayout.value = 0
  }, 1000)
}

function clearPattern() {
  configStore.setPatternList([])
}
function resetPattern() {
  configStore.resetPatternList()
}

function resetData() {
  configStore.reset()
  personStore.resetPerson()
  prizeStore.resetDefault()
  resetDialogOpen.value = false
  window.location.reload()
}

watch(rowCount, (val) => {
  if (val && val >= 1 && val <= 100) {
    isForceUpdateLayout.value = 1
  }
})
</script>
