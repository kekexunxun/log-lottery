<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-3xl font-bold tracking-tight">奖品管理</h2>
    </div>

    <div class="flex gap-2">
      <Button variant="outline" @click="addPrize">
        <Plus class="w-4 h-4 mr-2" />
        添加奖品
      </Button>

      <Dialog v-model:open="resetDialogOpen">
        <DialogTrigger as-child>
          <Button variant="outline">重置为默认</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>温馨提示</DialogTitle>
          <DialogDescription> 确认要重置为默认配置吗？此操作将清空所有奖品配置，且不可恢复！ </DialogDescription>
          <DialogFooter>
            <Button variant="outline" @click="resetDialogOpen = false">取消</Button>
            <Button variant="destructive" @click="confirmResetDefault">确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog v-model:open="deleteAllDialogOpen">
        <DialogTrigger as-child>
          <Button variant="destructive">
            <Trash2 class="w-4 h-4 mr-2" />
            全部删除
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>温馨提示</DialogTitle>
          <DialogDescription> 确认要删除所有奖品吗？此操作不可恢复！ </DialogDescription>
          <DialogFooter>
            <Button variant="outline" @click="deleteAllDialogOpen = false">取消</Button>
            <Button variant="destructive" @click="confirmDelAll">确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <Alert>
      <InfoIcon class="w-4 h-4" />
      <AlertDescription> 请谨慎重置，重置后将清空所有奖品配置 </AlertDescription>
    </Alert>

    <div class="space-y-4">
      <Card v-for="(item, index) in prizeList" :key="item.id" :ref="(el) => setPrizeCardRef(el, item.id)">
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="text-lg"> 奖品 #{{ index + 1 }} </CardTitle>
            <div class="flex gap-2">
              <Button variant="ghost" size="icon" :disabled="index === 0" @click="sort(item, 1)">
                <ArrowUp class="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" :disabled="index === prizeList.length - 1" @click="sort(item, 0)">
                <ArrowDown class="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" @click="editPrize(item)">
                <Edit class="w-4 h-4" />
              </Button>
              <Dialog v-model:open="deleteDialogOpen[item.id]">
                <DialogTrigger as-child>
                  <Button variant="destructive" size="icon">
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>温馨提示</DialogTitle>
                  <DialogDescription> 确认要删除奖品「{{ item.name }}」吗？此操作不可恢复！ </DialogDescription>
                  <DialogFooter>
                    <Button variant="outline" @click="deleteDialogOpen[item.id] = false">取消</Button>
                    <Button variant="destructive" @click="confirmDelItem(item)">确认</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 gap-x-8 gap-y-4">
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 rounded-lg overflow-hidden border bg-muted shrink-0">
                <img v-if="item.picture?.url" :src="item.picture.url" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground">无图片</div>
              </div>
              <div class="space-y-1">
                <div class="text-xl font-bold">{{ item.name }}</div>
                <div class="text-sm text-muted-foreground">中奖人数：{{ item.count }} 人</div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <div class="text-sm font-medium text-muted-foreground">全员参与</div>
                <div>{{ item.isAll ? '是' : '否' }}</div>
              </div>
              <div class="space-y-1">
                <div class="text-sm font-medium text-muted-foreground">已完成抽奖</div>
                <div class="flex items-center gap-2">
                  <Checkbox :checked="item.isUsed" disabled />
                  <span>{{ item.isUsed ? '已完成' : '进行中' }}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <PrizeDialog v-model="prizeDialogOpen" :prize="editingPrize" @submit="handlePrizeSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { usePriceStore } from '@/store'
import type { IPrizeConfig } from '@/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Plus, Trash2, ArrowUp, ArrowDown, InfoIcon, Edit } from 'lucide-vue-next'
import PrizeDialog from '@/components/PrizeDialog.vue'

const prizeStore = usePriceStore()
const { getPrizeConfig: prizeList } = storeToRefs(prizeStore)

const resetDialogOpen = ref(false)
const deleteAllDialogOpen = ref(false)
const deleteDialogOpen = reactive<Record<string | number, boolean>>({})
const prizeCardRefs = new Map<string | number, HTMLElement>()

const prizeDialogOpen = ref(false)
const editingPrize = ref<IPrizeConfig | null>(null)

function setPrizeCardRef(el: any, id: string | number) {
  if (el && el.$el) {
    prizeCardRefs.set(id, el.$el as HTMLElement)
  }
}

function addPrize() {
  editingPrize.value = null
  prizeDialogOpen.value = true
}

function editPrize(item: IPrizeConfig) {
  editingPrize.value = item
  prizeDialogOpen.value = true
}

async function handlePrizeSubmit(values: IPrizeConfig) {
  if (editingPrize.value) {
    // Edit existing prize
    prizeStore.updatePrizeConfig(values)
  } else {
    // Add new prize
    prizeStore.addPrizeConfig(values)
    await nextTick()
    const cardEl = prizeCardRefs.get(values.id)
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
}

function confirmResetDefault() {
  prizeStore.resetDefault()
  resetDialogOpen.value = false
}

function sort(item: IPrizeConfig, isUp: number) {
  const itemIndex = prizeList.value.indexOf(item)
  if (isUp === 1) {
    prizeList.value.splice(itemIndex, 1)
    prizeList.value.splice(itemIndex - 1, 0, item)
  } else {
    prizeList.value.splice(itemIndex, 1)
    prizeList.value.splice(itemIndex + 1, 0, item)
  }
}

function confirmDelItem(item: IPrizeConfig) {
  prizeStore.deletePrizeConfig(item.id)
  deleteDialogOpen[item.id] = false
}

function confirmDelAll() {
  prizeStore.deleteAllPrizeConfig()
  deleteAllDialogOpen.value = false
}
</script>
