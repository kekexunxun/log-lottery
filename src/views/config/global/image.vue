<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">图片管理</h2>
      <p class="text-muted-foreground">已添加图片: {{ configStore.imageList.length }} 张</p>
    </div>

    <div class="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" @click="handleAddDialog">
        <PlusIcon class="w-4 h-4 mr-2" />
        新增图片
      </Button>
    </div>

    <div
      v-if="configStore.imageList.length === 0"
      class="flex items-center justify-center py-12 text-sm text-muted-foreground"
    >
      暂无图片,点击新增按钮添加图片
    </div>

    <div v-else class="grid gap-4">
      <Card v-for="item in configStore.imageList" :key="item.id">
        <CardContent class="flex items-center gap-4 p-4">
          <div class="w-16 h-16 overflow-hidden rounded-lg shrink-0">
            <img :src="item.url" alt="Image" class="object-cover h-full rounded-xl" />
          </div>

          <div class="flex-1 min-w-0">
            <p class="font-medium truncate">
              {{ item.name }}
            </p>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {{ item.url === 'Storage' ? '本地存储' : '网络图片' }}
              </span>
            </div>
          </div>

          <Button variant="destructive" size="sm" @click="confirmDelete(item)">
            <Trash2Icon class="w-4 h-4 mr-2" />
            删除
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- 新增图片对话框 -->
    <Dialog v-model:open="addDialogOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogTitle>新增图片</DialogTitle>
        <DialogDescription> 添加本地图片或网络图片地址到库中 </DialogDescription>

        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <Label for="name">图片名称</Label>
            <Input id="name" v-model="newImage.name" placeholder="输入图片名称" />
          </div>

          <div class="grid gap-2">
            <Label>来源类型</Label>
            <Select v-model="newImage.type">
              <SelectTrigger>
                <SelectValue placeholder="选择图片来源" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">
                  <div class="flex items-center">
                    <ImageIcon class="w-4 h-4 mr-2" />
                    本地上传
                  </div>
                </SelectItem>
                <SelectItem value="network">
                  <div class="flex items-center">
                    <GlobeIcon class="w-4 h-4 mr-2" />
                    网络地址
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div v-if="newImage.type === 'local'" class="grid gap-2">
            <Label>选择文件</Label>
            <div class="flex items-center gap-2">
              <label
                for="image-upload"
                class="flex flex-1 items-center justify-center px-4 py-2 border-2 border-dashed rounded-md cursor-pointer hover:bg-secondary/50 transition-colors"
              >
                <input id="image-upload" type="file" class="hidden" accept="image/*" @change="handleFileChange" />
                <div class="flex flex-col items-center gap-1 text-sm text-muted-foreground">
                  <UploadIcon v-if="!newImage.file" class="w-6 h-6" />
                  <span v-if="!newImage.file">点击选择图片</span>
                  <span v-else class="text-primary font-medium">{{ newImage.file.name }}</span>
                </div>
              </label>
            </div>
          </div>

          <div v-else class="grid gap-2">
            <Label for="url">图片地址</Label>
            <Input id="url" v-model="newImage.url" placeholder="https://example.com/image.jpg" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="addDialogOpen = false"> 取消 </Button>
          <Button @click="handleAddImage"> 确认添加 </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 删除确认对话框 -->
    <Dialog v-model:open="deleteDialogOpen">
      <DialogContent>
        <DialogTitle>确认删除</DialogTitle>
        <DialogDescription> 确定要删除图片 "{{ imageToDelete?.name }}" 吗？此操作无法撤销。 </DialogDescription>
        <DialogFooter>
          <Button variant="outline" @click="deleteDialogOpen = false"> 取消 </Button>
          <Button variant="destructive" @click="removeImage"> 确认删除 </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { IImage } from '@/types'
import { useConfigStore } from '@/store'
import { readFileData } from '@/utils/file'
import localforage from 'localforage'
import { ref, reactive } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UploadIcon, Trash2Icon, PlusIcon, GlobeIcon, ImageIcon } from 'lucide-vue-next'

const configStore = useConfigStore()
const deleteDialogOpen = ref(false)
const addDialogOpen = ref(false)
const imageToDelete = ref<IImage | null>(null)
const imageDbStore = localforage.createInstance({ name: 'imgStore' })

const newImage = reactive({
  name: '',
  type: 'local' as 'local' | 'network',
  url: '',
  file: null as File | null
})

function resetNewImage() {
  newImage.name = ''
  newImage.type = 'local'
  newImage.url = ''
  newImage.file = null
}

function handleAddDialog() {
  resetNewImage()
  addDialogOpen.value = true
}

async function handleFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files as FileList
  if (!files || files.length === 0) return

  const isImage = /image.*/.test(files[0].type)
  if (!isImage) {
    toast.error('不是图片文件')
    return
  }

  newImage.file = files[0]
  if (!newImage.name) {
    newImage.name = files[0].name
  }
}

async function handleAddImage() {
  if (!newImage.name) {
    toast.error('请输入图片名称')
    return
  }

  if (newImage.type === 'local') {
    if (!newImage.file) {
      toast.error('请选择图片文件')
      return
    }

    try {
      const { dataUrl, fileName } = await readFileData(newImage.file)
      const imageId = `${new Date().getTime().toString()}+${fileName}`

      await imageDbStore.setItem(imageId, dataUrl)

      configStore.imageList.push({
        id: imageId,
        name: newImage.name || fileName,
        url: 'Storage'
      })

      toast.success('添加成功')
      addDialogOpen.value = false
      resetNewImage()
    } catch (error) {
      toast.error('添加失败')
    }
  } else {
    if (!newImage.url) {
      toast.error('请输入网络图片地址')
      return
    }

    configStore.imageList.push({
      id: new Date().getTime().toString(),
      name: newImage.name,
      url: newImage.url
    })

    toast.success('添加成功')
    addDialogOpen.value = false
    resetNewImage()
  }
}

function confirmDelete(item: IImage) {
  imageToDelete.value = item
  deleteDialogOpen.value = true
}

async function removeImage() {
  if (!imageToDelete.value) return

  const item = imageToDelete.value
  if (item.url === 'Storage') {
    await imageDbStore.removeItem(item.id)
  }
  configStore.imageList = configStore.imageList.filter((img) => img.id !== item.id)
  toast.success('删除成功')

  // 关闭对话框并清空待删除项
  deleteDialogOpen.value = false
  imageToDelete.value = null
}
</script>
