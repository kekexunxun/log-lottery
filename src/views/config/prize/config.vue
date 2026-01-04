<template>
  <div class="space-y-6 h-full flex flex-col">
    <div class="flex items-center justify-between flex-none">
      <h2 class="text-3xl font-bold tracking-tight">奖品管理</h2>
      <div class="flex gap-2">
        <Button variant="outline" @click="addPrize">
          <PlusIcon class="w-4 h-4 mr-2" />
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
              <Trash2Icon class="w-4 h-4 mr-2" />
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
    </div>

    <Alert class="flex-none">
      <InfoIcon class="w-4 h-4" />
      <AlertDescription> 请谨慎重置，重置后将清空所有奖品配置 </AlertDescription>
    </Alert>

    <!-- 列表展示区域 -->
    <div v-if="prizeStore.prizeList.length > 0" class="border rounded-lg bg-background flex-1 min-h-0 flex flex-col">
      <div v-for="(item, index) in prizeStore.prizeList" :key="item.id" class="mb-4">
        <Card
          class="hover:shadow-lg transition-all duration-300 hover:border-primary/50 group relative overflow-hidden"
        >
          <CardHeader class="pb-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span
                  class="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold"
                >
                  {{ index + 1 }}
                </span>
                <CardTitle class="text-lg flex items-center gap-2">
                  {{ item.name }}
                  <!-- <Badge v-if="!item.isShow" variant="secondary" class="text-xs font-normal"> 已隐藏 </Badge> -->
                </CardTitle>
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" class="h-8 w-8" :disabled="index === 0" @click="sort(item, 1)">
                  <ArrowUpIcon class="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  :disabled="index === prizeStore.prizeList.length - 1"
                  @click="sort(item, 0)"
                >
                  <ArrowDownIcon class="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" class="h-8 w-8" @click="editPrize(item)">
                  <EditIcon class="w-4 h-4" />
                </Button>
                <Dialog v-model:open="deleteDialogOpen[item.id]">
                  <DialogTrigger as-child>
                    <Button variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2Icon class="w-4 h-4" />
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
            <div class="flex flex-col sm:flex-row gap-6">
              <!-- 图片展示区域 -->
              <div class="w-full sm:w-32 h-32 rounded-lg overflow-hidden border bg-muted shrink-0 relative group/image">
                <img
                  :src="item.picture.url"
                  loading="lazy"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
                  :alt="item.name"
                />
              </div>

              <!-- 信息展示区域 -->
              <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="space-y-1">
                  <div class="text-sm font-medium text-muted-foreground">中奖人数</div>
                  <div class="text-2xl font-bold tracking-tight">
                    {{ item.count }} <span class="text-sm font-normal text-muted-foreground">人</span>
                  </div>
                </div>

                <div class="space-y-1">
                  <div class="text-sm font-medium text-muted-foreground">每次抽取</div>
                  <div class="text-lg">
                    {{ item.frequency || 1 }} <span class="text-sm text-muted-foreground">人/次</span>
                  </div>
                </div>

                <div class="space-y-1">
                  <div class="text-sm font-medium text-muted-foreground">参与范围</div>
                  <div class="flex items-center gap-2">
                    <Badge :variant="item.isAll ? 'default' : 'outline'">
                      {{ item.isAll ? '全员参与' : '仅未中奖人员参与' }}
                    </Badge>
                  </div>
                </div>

                <div class="space-y-1">
                  <div class="text-sm font-medium text-muted-foreground">抽奖状态</div>
                  <div class="flex items-center gap-2">
                    <Badge
                      :variant="item.isUsed ? 'secondary' : 'default'"
                      :class="item.isUsed ? 'bg-muted text-muted-foreground' : 'bg-green-600 hover:bg-green-700'"
                    >
                      {{ item.isUsed ? '已完成' : '进行中' }}
                    </Badge>
                  </div>
                </div>

                <!-- <div class="space-y-1 sm:col-span-2 lg:col-span-3">
                  <div class="text-sm font-medium text-muted-foreground">备注信息</div>
                  <div class="text-sm text-muted-foreground line-clamp-2" :title="item.desc">
                    {{ item.desc || '暂无备注' }}
                  </div>
                </div> -->
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- 空状态展示 -->
    <div v-else class="flex flex-col items-center justify-center py-16 border rounded-lg border-dashed bg-muted/30">
      <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <GiftIcon class="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 class="text-lg font-medium">暂无奖品配置</h3>
      <p class="text-sm text-muted-foreground mt-2 mb-4">点击上方"添加奖品"按钮开始配置</p>
      <Button variant="outline" @click="addPrize">
        <PlusIcon class="w-4 h-4 mr-2" />
        添加第一个奖品
      </Button>
    </div>

    <PrizeDialog v-model="prizeDialogOpen" :prize="editingPrize" @submit="handlePrizeSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, reactive } from 'vue'
import { usePriceStore } from '@/store'
import type { IPrizeConfig } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { PlusIcon, Trash2Icon, ArrowUpIcon, ArrowDownIcon, InfoIcon, EditIcon, GiftIcon } from 'lucide-vue-next'

const prizeStore = usePriceStore()

const resetDialogOpen = ref(false)
const deleteAllDialogOpen = ref(false)
const deleteDialogOpen = reactive<Record<string | number, boolean>>({})

const prizeDialogOpen = ref(false)
const editingPrize = ref<IPrizeConfig | null>(null)

/**
 * 打开添加奖品弹窗
 */
function addPrize() {
  editingPrize.value = null
  prizeDialogOpen.value = true
}

/**
 * 打开编辑奖品弹窗
 * @param item 奖品配置项
 */
function editPrize(item: IPrizeConfig) {
  editingPrize.value = item
  prizeDialogOpen.value = true
}

/**
 * 处理奖品提交（添加或更新）
 * @param values 奖品表单数据
 */
async function handlePrizeSubmit(values: IPrizeConfig) {
  console.log('handlePrizeSubmit', values)
  if (editingPrize.value) {
    // 编辑现有奖品
    prizeStore.updatePrizeConfig(values)
    return
  }

  // 添加新奖品
  prizeStore.addPrizeConfig(values)
  await nextTick()
  // 滚动到底部查看新添加的奖品
}

/**
 * 确认重置为默认配置
 */
function confirmResetDefault() {
  prizeStore.resetDefault()
  resetDialogOpen.value = false
}

/**
 * 奖品排序
 * @param item 奖品配置项
 * @param isUp 1: 上移, 0: 下移
 */
function sort(item: IPrizeConfig, isUp: number) {
  const itemIndex = prizeStore.prizeList.indexOf(item)
  if (isUp === 1) {
    if (itemIndex > 0) {
      prizeStore.prizeList.splice(itemIndex, 1)
      prizeStore.prizeList.splice(itemIndex - 1, 0, item)
    }
  } else {
    if (itemIndex < prizeStore.prizeList.length - 1) {
      prizeStore.prizeList.splice(itemIndex, 1)
      prizeStore.prizeList.splice(itemIndex + 1, 0, item)
    }
  }
}

/**
 * 确认删除单个奖品
 * @param item 奖品配置项
 */
function confirmDelItem(item: IPrizeConfig) {
  prizeStore.deletePrizeConfig(item.id)
  deleteDialogOpen[item.id] = false
}

/**
 * 确认删除所有奖品
 */
function confirmDelAll() {
  prizeStore.deleteAllPrizeConfig()
  deleteAllDialogOpen.value = false
}
</script>
