import type { IImage } from '@/types'
import { defineStore } from 'pinia'
import { defaultImageList, defaultPatternList } from './data'

interface IConfigStore {
  topTitle: string // 页面标题
  rowCount: number // 卡片列数
  isShowPrizeList: boolean // 是否显示奖项列表
  isShowAvatar: boolean // 是否显示头像
  theme: {
    name: string // 主题名称
    detail: {
      primary: string // 主要颜色
    }
    cardColor: string // 卡片颜色
    cardWidth: number // 卡片宽度
    cardHeight: number // 卡片高度
    textColor: string // 文本颜色
    luckyCardColor: string // 幸运卡片颜色
    textSize: number // 文本大小
    patternColor: string // 图案颜色
    patternList: number[] // 图案列表
    background: { id?: string; name?: string; url?: string } // 背景颜色或图片
  }
  imageList: IImage[] // 图片列表
}

export const useConfigStore = defineStore('config', {
  state: (): IConfigStore => ({
    rowCount: 17,
    isShowPrizeList: true,
    isShowAvatar: false,
    topTitle: '大明内阁六部御前奏对',
    theme: {
      name: 'dracula',
      detail: { primary: '#0f5fd3' },
      cardColor: '#ff79c6',
      cardWidth: 140,
      cardHeight: 200,
      textColor: '#ffffff',
      luckyCardColor: '#ECB1AC',
      textSize: 30,
      patternColor: '#1b66c9',
      patternList: defaultPatternList,
      background: {} // 背景颜色或图片
    },
    imageList: defaultImageList
  }),
  getters: {
    // 获取图片列表
    getImageList: (state) => state.imageList
  },
  actions: {
    setTopTitle(title: string) {
      this.topTitle = title
    },
    setRowCount(count: number) {
      this.rowCount = count
    },
    setCardColor(color: string) {
      this.theme.cardColor = color
    },
    setLuckyCardColor(color: string) {
      this.theme.luckyCardColor = color
    },
    setTextColor(color: string) {
      this.theme.textColor = color
    },
    setCardSize(size: { width: number; height: number }) {
      this.theme.cardWidth = size.width
      this.theme.cardHeight = size.height
    },
    setTextSize(size: number) {
      this.theme.textSize = size
    },
    setPatterColor(color: string) {
      this.theme.patternColor = color
    },
    setPatternList(list: number[]) {
      this.theme.patternList = list
    },
    resetPatternList() {
      this.theme.patternList = defaultPatternList
    },
    setIsShowPrizeList(isShow: boolean) {
      this.isShowPrizeList = isShow
    },
    setIsShowAvatar(isShow: boolean) {
      this.isShowAvatar = isShow
    },
    setBackground(bg: { id?: string; name?: string; url?: string }) {
      this.theme.background = bg
    },
    setLanguage(lang: string) {
      // 语言设置逻辑
    },
    reset() {
      this.rowCount = 17
      this.isShowPrizeList = true
      this.isShowAvatar = false
      this.topTitle = '大明内阁六部御前奏对'
      this.theme = {
        name: 'dracula',
        detail: { primary: '#0f5fd3' },
        cardColor: '#ff79c6',
        cardWidth: 140,
        cardHeight: 200,
        textColor: '#ffffff',
        luckyCardColor: '#ECB1AC',
        textSize: 30,
        patternColor: '#1b66c9',
        patternList: defaultPatternList,
        background: {}
      }
    }
  },
  persist: {
    key: 'config'
  }
})
