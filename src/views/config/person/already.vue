<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">中奖名单管理</h2>
      <p class="text-muted-foreground">中奖人数: {{ personStore.alreadyPersonList.length }}</p>
    </div>

    <!-- 详细视图 -->
    <div class="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>编号</TableHead>
            <TableHead>姓名</TableHead>
            <TableHead>头像</TableHead>
            <TableHead>部门</TableHead>
            <TableHead>身份</TableHead>
            <TableHead>奖品名称</TableHead>
            <TableHead>中奖时间</TableHead>
            <TableHead class="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="personStore.alreadyPersonList.length === 0">
            <TableCell colspan="8" class="h-24 text-center">暂无数据</TableCell>
          </TableRow>
          <TableRow v-for="item in personStore.alreadyPersonList" :key="`${item.id}-${item.prizeTime}`">
            <TableCell class="font-medium">
              {{ item.uid }}
            </TableCell>
            <TableCell>{{ item.name }}</TableCell>
            <TableCell>
              <img v-if="item.avatar" :src="item.avatar" alt="avatar" class="object-cover w-10 h-10 rounded" />
              <span v-else class="text-muted-foreground">-</span>
            </TableCell>
            <TableCell>{{ item.department }}</TableCell>
            <TableCell>{{ item.identity }}</TableCell>
            <TableCell>
              <Badge variant="secondary">
                {{ item.prizeName }}
              </Badge>
            </TableCell>
            <TableCell class="text-sm text-muted-foreground">
              {{ item.prizeTime }}
            </TableCell>
            <TableCell class="text-right">
              <Button variant="outline" size="sm" @click="handleMoveNotPerson(item)"> 移除 </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IPersonConfig } from '@/types'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { usePersonStore } from '@/store'

const personStore = usePersonStore()

function handleMoveNotPerson(row: IPersonConfig) {
  personStore.moveAlreadyToNot(row)
}
</script>
