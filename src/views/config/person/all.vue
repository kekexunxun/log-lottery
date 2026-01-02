<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">人员列表管理</h2>
      <p class="text-muted-foreground">
        中奖人数: {{ personStore.alreadyPersonList.length }} / {{ personStore.allPersonList.length }}
      </p>
    </div>

    <div class="flex flex-wrap gap-2">
      <!-- 删除全部 -->
      <Dialog v-model:open="deleteAllDialogOpen">
        <DialogTrigger as-child>
          <Button variant="destructive" size="sm">
            <Trash2 class="w-4 h-4 mr-2" />
            全部删除
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>温馨提示</DialogTitle>
          <DialogDescription> 确认删除所有人员吗？ </DialogDescription>
          <DialogFooter>
            <Button variant="outline" @click="deleteAllDialogOpen = false"> 取消 </Button>
            <Button variant="destructive" @click="deleteAll"> 确认 </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- 下载模板 -->
      <a download="人员名单.xlsx" target="_blank" href="/用户列表.xlsx">
        <Button variant="secondary" size="sm">
          <Download class="w-4 h-4 mr-2" />
          下载模板
        </Button>
      </a>

      <!-- 导入数据 -->
      <div>
        <input ref="fileInputRef" type="file" class="hidden" accept=".xlsx,.xls" @change="handleFileChange" />
        <Button variant="outline" size="sm" @click="triggerFileInput">
          <Upload class="w-4 h-4 mr-2" />
          导入数据
        </Button>
      </div>

      <!-- 重置数据 -->
      <Dialog v-model:open="resetDialogOpen">
        <DialogTrigger as-child>
          <Button variant="outline" size="sm">
            <RefreshCw class="w-4 h-4 mr-2" />
            重置数据
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>温馨提示</DialogTitle>
          <DialogDescription> 确认重置中奖者吗？ </DialogDescription>
          <DialogFooter>
            <Button variant="outline" @click="resetDialogOpen = false"> 取消 </Button>
            <Button @click="resetData"> 确认 </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- 导出结果 -->
      <Button variant="outline" size="sm" @click="exportData">
        <Download class="w-4 h-4 mr-2" />
        导出结果
      </Button>

      <!-- 删除单人确认 -->
      <Dialog v-model:open="deleteDialogOpen">
        <DialogContent>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription> 确定要删除人员 {{ personToDelete?.name }} 吗？此操作不可撤销。 </DialogDescription>
          <DialogFooter>
            <Button variant="outline" @click="deleteDialogOpen = false"> 取消 </Button>
            <Button variant="destructive" @click="handleDelete"> 确认删除 </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <!-- 提示信息 -->
    <Alert v-if="personStore.allPersonList.length === 0">
      <InfoIcon class="w-4 h-4" />
      <AlertDescription> 请上传Excel文件导入人员数据 </AlertDescription>
    </Alert>

    <!-- 数据表格 -->
    <div class="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>编号</TableHead>
            <TableHead>姓名</TableHead>
            <TableHead>部门</TableHead>
            <TableHead>头像</TableHead>
            <TableHead>身份</TableHead>
            <TableHead>是否中奖</TableHead>
            <TableHead class="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="personStore.allPersonList.length === 0">
            <TableCell colspan="7" class="h-24 text-center"> 暂无数据 </TableCell>
          </TableRow>
          <TableRow v-for="person in personStore.allPersonList" :key="person.id">
            <TableCell class="font-medium">
              {{ person.uid }}
            </TableCell>
            <TableCell>{{ person.name }}</TableCell>
            <TableCell>{{ person.department }}</TableCell>
            <TableCell>
              <img v-if="person.avatar" :src="person.avatar" alt="avatar" class="object-cover w-10 h-10 rounded" />
              <span v-else class="text-muted-foreground">-</span>
            </TableCell>
            <TableCell>{{ person.identity }}</TableCell>
            <TableCell>
              <Badge :variant="person.isWin ? 'success' : 'secondary'">
                {{ person.isWin ? '是' : '否' }}
              </Badge>
            </TableCell>
            <TableCell class="text-right">
              <Button variant="destructive" size="xs" @click="confirmDelete(person)"> 删除 </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import type { IPersonConfig } from '@/types'
import { readFileBinary } from '@/utils/file'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, Upload, RefreshCw, Trash2, InfoIcon } from 'lucide-vue-next'
import { usePersonStore } from '@/store'
import dayjs from 'dayjs'
import { toast } from 'vue-sonner'

const personStore = usePersonStore()

const fileInputRef = ref<HTMLInputElement>()
const resetDialogOpen = ref(false)
const deleteAllDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const personToDelete = ref<IPersonConfig | null>(null)

function confirmDelete(person: IPersonConfig) {
  personToDelete.value = person
  deleteDialogOpen.value = true
}

function handleDelete() {
  if (personToDelete.value) {
    personStore.deletePerson(personToDelete.value)
    deleteDialogOpen.value = false
    personToDelete.value = null
  }
}

async function handleFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return

  // TODO 方法优化
  const dataBinary = await readFileBinary(files[0])
  const workBook = XLSX.read(dataBinary, { type: 'binary', cellDates: true })
  const workSheet = workBook.Sheets[workBook.SheetNames[0]]
  const excelData = XLSX.utils.sheet_to_json(workSheet) as any[]

  const userData: IPersonConfig[] = excelData.map((item, index) => ({
    avatar: item['头像'],
    name: item['姓名'],
    department: item['称谓'],
    uid: item['编号'],
    identity: item['身份'],
    id: index + 1,
    isWin: false,
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    prizeName: [],
    prizeTime: [],
    prizeId: [],
    x: 0,
    y: 0
  }))

  personStore.resetPerson()
  personStore.addNotPersonList(userData)

  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function exportData() {
  if (personStore.allPersonList.length === 0) {
    toast.error('暂无数据')
    return
  }

  let data = personStore.allPersonList.map((item) => ({
    编号: item.uid,
    姓名: item.name,
    头像: item.avatar,
    部门: item.department,
    身份: item.identity,
    是否中奖: item.isWin ? '是' : '否',
    中奖时间: item.prizeTime.join(','),
    奖品名称: item.prizeName.join(',')
  }))

  const dataBinary = XLSX.utils.json_to_sheet(data)
  const workBook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workBook, dataBinary, 'Sheet1')
  XLSX.writeFile(workBook, '用户数据.xlsx')
}

function resetData() {
  personStore.resetAlreadyPerson()
  resetDialogOpen.value = false
}

function deleteAll() {
  personStore.deleteAllPerson()
  deleteAllDialogOpen.value = false
}

function triggerFileInput() {
  fileInputRef.value?.click()
}
</script>
