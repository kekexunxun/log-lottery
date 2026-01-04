<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>输入抽奖码</DialogTitle>
        <DialogDescription>请输入16位抽奖码以导入成员信息</DialogDescription>
      </DialogHeader>
      <div class="space-y-4">
        <div class="space-y-2">
          <input
            v-model="lotteryCodeInput"
            type="text"
            placeholder="请输入抽奖码"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxlength="16"
            @keyup.enter="handleLotteryCodeSubmit"
          />
          <p v-if="lotteryCodeError" class="text-sm text-red-500">{{ lotteryCodeError }}</p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="open = false">取消</Button>
        <Button :disabled="lotteryCodeLoading || !lotteryCodeInput" @click="handleLotteryCodeSubmit">
          {{ lotteryCodeLoading ? '加载中...' : '确定' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { getTeamMemberByLotteryCode } from '@/api/team'
import { usePersonStore } from '@/store'
import { toast } from 'vue-sonner'

const open = defineModel<boolean>('open')
const personStore = usePersonStore()

const lotteryCodeInput = ref('')
const lotteryCodeError = ref('')
const lotteryCodeLoading = ref(false)

watch(open, (newVal) => {
  if (newVal) {
    lotteryCodeInput.value = ''
    lotteryCodeError.value = ''
    lotteryCodeLoading.value = false
  }
})

async function handleLotteryCodeSubmit() {
  const code = lotteryCodeInput.value.trim()

  if (!code) {
    lotteryCodeError.value = '请输入抽奖码'
    return
  }

  if (code.length !== 16) {
    lotteryCodeError.value = '抽奖码格式不正确，应为16位字符'
    return
  }

  lotteryCodeLoading.value = true
  lotteryCodeError.value = ''

  try {
    const response = await getTeamMemberByLotteryCode({ code })
    if (response.member_list?.length === 0) {
      lotteryCodeError.value = '该抽奖码暂无成员'
      return
    }

    // 将成员数据转换为人员列表格式
    const members = response.member_list.map((member: any, index: number) => ({
      id: index + 1,
      uid: `${index + 1}`,
      name: member.realname || member.nickname,
      nickname: member.nickname,
      avatar: member.avatar,
      department: response.team_name,
      identity: '战队成员',
      x: 0,
      y: 0,
      isWin: false,
      createTime: new Date().toString(),
      updateTime: new Date().toString(),
      prizeName: [],
      prizeTime: [],
      prizeId: []
    }))

    if (members.length === 0) {
      lotteryCodeError.value = '该战队暂无成员'
      return
    }

    // 清空现有数据，添加新成员
    personStore.deleteAllPerson()
    personStore.addNotPersonList(members)
    personStore.$patch({
      initAt: Date.now()
    })

    // 关闭弹窗
    open.value = false

    // 提示成功
    toast.success(`成功导入 ${members.length} 名成员`)

    // 重新初始化数据
    window.location.reload()
  } catch (error: any) {
    lotteryCodeError.value = error.message || '抽奖码无效或已过期'
  } finally {
    lotteryCodeLoading.value = false
  }
}
</script>
