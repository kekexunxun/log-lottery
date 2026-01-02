import type { IPersonConfig, IPrizeConfig } from '@/types'

import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { defaultPersonList } from './data'
import { usePriceStore } from './price'

interface IPersonState {
  id: number
  uid: string
  name: string
  department: string
  identity: string
  avatar: string
  isWin: boolean
  x: number
  y: number
  createTime: string
  updateTime: string
  prizeName: string[]
  prizeId: string[]
  prizeTime: string[]
}

interface IPersonStore {
  allPersonList: IPersonState[]
  alreadyPersonList: IPersonState[]
}

export const usePersonStore = defineStore('person', {
  state: (): IPersonStore => ({
    allPersonList: [],
    alreadyPersonList: []
  }),
  getters: {
    // 获取未获此奖的人员名单
    getNotThisPrizePersonList: (state) => () => {
      const currentPrize = usePriceStore().currentPrize
      const data = state.allPersonList.filter((item: IPersonConfig) => {
        return !item.prizeId.includes(currentPrize.id as string)
      })

      return data
    },
    // 获取已中奖人员名单
    getAlreadyPersonList: (state) => () => {
      return state.allPersonList.filter((item: IPersonConfig) => {
        return item.isWin === true
      })
    },
    // 获取中奖人员详情
    getAlreadyPersonDetail: (state) => () => {
      return state.alreadyPersonList
    },
    // 获取未中奖人员名单
    getNotPersonList: (state) => () => {
      return state.allPersonList.filter((item: IPersonConfig) => {
        return item.isWin === false
      })
    }
  },
  actions: {
    // 添加未中奖人员
    addNotPersonList(personList: IPersonConfig[]) {
      if (personList.length <= 0) {
        return
      }
      personList.forEach((item: IPersonConfig) => {
        this.allPersonList.push(item)
      })
    },
    // 添加已中奖人员
    addAlreadyPersonList(personList: IPersonConfig[], prize: IPrizeConfig | null) {
      if (personList.length <= 0) {
        return
      }
      personList.forEach((person: IPersonConfig) => {
        this.allPersonList.map((item: IPersonConfig) => {
          if (item.id === person.id && prize != null) {
            item.isWin = true
            // person.isWin = true
            item.prizeName.push(prize.name)
            // person.prizeName += prize.name
            item.prizeTime.push(dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'))
            // person.prizeTime = new Date().toString()
            item.prizeId.push(prize.id as string)
          }

          return item
        })
        this.alreadyPersonList.push(person)
      })
    },
    // 从已中奖移动到未中奖
    moveAlreadyToNot(person: IPersonConfig) {
      const index = this.alreadyPersonList.findIndex((item) => item.id === person.id)
      this.allPersonList[index] = {
        ...this.allPersonList[index],
        isWin: false,
        prizeName: [],
        prizeTime: [],
        prizeId: []
      }

      this.alreadyPersonList = this.alreadyPersonList.filter((item) => item.id !== person.id)
    },
    // 删除指定人员
    deletePerson(person: IPersonConfig) {
      if (person.id !== undefined || person.id != null) {
        this.allPersonList = this.allPersonList.filter((item) => item.id !== person.id)
        this.alreadyPersonList = this.alreadyPersonList.filter((item) => item.id !== person.id)
      }
    },
    // 删除所有人员
    deleteAllPerson() {
      this.allPersonList = []
      this.alreadyPersonList = []
    },

    // 删除所有人员
    resetPerson() {
      this.allPersonList = []
      this.alreadyPersonList = []
    },
    // 重置已中奖人员
    resetAlreadyPerson() {
      // 把已中奖人员合并到未中奖人员，要验证是否已存在
      this.allPersonList.forEach((item: IPersonConfig) => {
        item.isWin = false
        item.prizeName = []
        item.prizeTime = []
        item.prizeId = []
      })
      this.alreadyPersonList = []
    },
    setDefaultPersonList() {
      this.allPersonList = defaultPersonList
      this.alreadyPersonList = []
    }
  },
  persist: {
    key: 'person'
  }
})
