import { defineStore } from 'pinia'
import { defaultCurrentPrize, defaultPrizeList } from './data'

export interface IPrizeConfig {
  id: number | string
  name: string
  sort: number
  isAll: boolean
  count: number
  isUsedCount: number
  picture: { id: string; name: string; url: string }
  separateCount: {
    enable: boolean
    countList: { id: string; count: number; isUsedCount: number }[]
  }
  desc: string
  isShow: boolean
  isUsed: boolean
  frequency: number
}

interface IPrizeStore {
  currentPrize: IPrizeConfig
  prizeList: IPrizeConfig[]
  temporaryPrize: IPrizeConfig
}

export const usePriceStore = defineStore('prize', {
  state: (): IPrizeStore => ({
    prizeList: defaultPrizeList,
    currentPrize: defaultCurrentPrize,
    temporaryPrize: {
      id: '',
      name: '',
      sort: 0,
      isAll: false,
      count: 1,
      isUsedCount: 0,
      picture: { id: '-1', name: '', url: '' },
      separateCount: { enable: true, countList: [] },
      desc: '',
      isShow: false,
      isUsed: false,
      frequency: 1
    }
  }),
  getters: {
    // 获取奖品列表
    getPrizeConfig: (state) => state.prizeList,
    // 根据id获取配置
    getPrizeConfigById: (state) => (id: number) => {
      return state.prizeList.find((item) => item.id === id)
    }
  },
  actions: {
    // 更新奖项数据
    updatePrizeConfig(prizeConfigItem: IPrizeConfig) {
      const index = this.prizeList.findIndex((item) => item.id === prizeConfigItem.id)
      if (index !== -1) {
        this.prizeList[index] = { ...prizeConfigItem }
      }
    },
    // 添加奖项
    addPrizeConfig(prizeConfig: IPrizeConfig) {
      this.prizeList.push(prizeConfig)
    },
    // 删除单个奖项
    deletePrizeConfig(id: string | number) {
      this.prizeList = this.prizeList.filter((item) => item.id !== id)
    },
    // 删除全部奖项
    deleteAllPrizeConfig() {
      this.prizeList = [] as IPrizeConfig[]
    },
    // 设置奖项列表
    setPrizeConfig(prizeList: IPrizeConfig[]) {
      this.prizeList = prizeList
    },
    // 重置为默认配置
    resetDefault() {
      this.prizeList = defaultPrizeList
      this.currentPrize = defaultCurrentPrize
    },
    // 设置当前奖项
    setCurrentPrize(prizeConfigItem: IPrizeConfig) {
      this.currentPrize = prizeConfigItem
    },
    // 设置临时奖项
    setTemporaryPrize(prizeItem: IPrizeConfig) {
      if (prizeItem.isShow === false) {
        for (let i = 0; i < this.prizeList.length; i++) {
          if (this.prizeList[i].isUsed === false) {
            this.setCurrentPrize(this.prizeList[i])

            break
          }
        }
        this.resetTemporaryPrize()

        return
      }

      this.temporaryPrize = prizeItem
    },
    // 重置临时奖项
    resetTemporaryPrize() {
      this.temporaryPrize = {
        id: '',
        name: '',
        sort: 0,
        isAll: false,
        count: 1,
        isUsedCount: 0,
        picture: { id: '-1', name: '', url: '' },
        separateCount: { enable: true, countList: [] },
        desc: '',
        isShow: false,
        isUsed: false,
        frequency: 1
      }
    }
  },
  persist: {
    key: 'price'
  }
})
