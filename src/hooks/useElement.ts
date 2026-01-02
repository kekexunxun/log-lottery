import { useConfigStore } from '@/store'
import type { IPersonConfig } from '@/types'
import { rgba } from '@/utils/color'

export function useElementStyle(props: {
  element: HTMLDivElement
  person?: Partial<IPersonConfig>
  index: number
  patternList?: number[]
  patternColor?: string
  cardColor?: string
  cardSize?: { width: number; height: number }
  textSize?: number
  mod?: 'default' | 'lucky' | 'sphere'
  type?: 'add' | 'change'
}) {
  const configStore = useConfigStore()
  const {
    element,
    person,
    index,
    patternList = configStore.theme.patternList,
    patternColor = configStore.theme.patternColor,
    cardColor = configStore.theme.cardColor,
    cardSize = { width: configStore.theme.cardWidth, height: configStore.theme.cardHeight },
    textSize = configStore.theme.textSize,
    mod = 'default',
    type = 'add'
  } = props

  if (patternList.includes(index + 1) && mod === 'default') {
    element.style.backgroundColor = rgba(patternColor, Math.random() * 0.2 + 0.8)
  } else if (mod === 'sphere' || mod === 'default') {
    element.style.backgroundColor = rgba(cardColor, Math.random() * 0.5 + 0.25)
  } else if (mod === 'lucky') {
    element.style.backgroundColor = rgba(cardColor, 0.8)
  }
  element.style.border = `1px solid ${rgba(cardColor, 0.25)}`
  element.style.boxShadow = `0 0 12px ${rgba(cardColor, 0.5)}`
  element.style.width = `${cardSize.width}px`
  element.style.height = `${cardSize.height}px`
  if (mod === 'lucky') {
    element.className = 'lucky-element-card'
  } else {
    element.className = 'element-card'
  }
  if (type === 'add') {
    element.addEventListener('mouseenter', (ev: MouseEvent) => {
      const target = ev.target as HTMLElement
      target.style.border = `1px solid ${rgba(cardColor, 0.75)}`
      target.style.boxShadow = `0 0 12px ${rgba(cardColor, 0.75)}`
    })
    element.addEventListener('mouseleave', (ev: MouseEvent) => {
      const target = ev.target as HTMLElement
      target.style.border = `1px solid ${rgba(cardColor, 0.25)}`
      target.style.boxShadow = `0 0 12px ${rgba(cardColor, 0.5)}`
    })
  }

  // 如果展示头像，那么只有头像和名称
  if (configStore.isShowAvatar) {
    if (person?.name) {
      ;(element.children[0] as HTMLElement).style.fontSize = `${textSize}px`
      ;(element.children[0] as HTMLElement).style.lineHeight = `${textSize * 3}px`
      ;(element.children[0] as HTMLElement).style.textShadow = `0 0 12px ${rgba(cardColor, 0.95)}`
      element.children[0].textContent = person.name
    }

    if (person?.avatar) {
      ;(element.children[1] as HTMLImageElement).src = person.avatar
    }
  } else {
    if (person?.uid) {
      element.children[0].textContent = person.uid
    }

    if (person?.name) {
      ;(element.children[1] as HTMLElement).style.fontSize = `${textSize}px`
      ;(element.children[1] as HTMLElement).style.lineHeight = `${textSize * 3}px`
      ;(element.children[1] as HTMLElement).style.textShadow = `0 0 12px ${rgba(cardColor, 0.95)}`
      element.children[1].textContent = person.name
    }

    ;(element.children[2] as HTMLElement).style.fontSize = `${textSize * 0.5}px`
    if (person?.department || person?.identity) {
      element.children[2].innerHTML = `${person.department ? person.department : ''}<br/>${person.identity ? person.identity : ''}`
    }
  }

  return element
}

/**
 * @description 设置抽中卡片的位置
 * 最少一个，最大十个
 */
export function useElementPosition(totalCount: number, cardSize: { width: number; height: number }, cardIndex: number) {
  const spacingX = cardSize.width + 100
  const spacingY = cardSize.height + 60

  let row1Count = 0
  let row2Count = 0

  if (totalCount <= 5) {
    row1Count = totalCount
    row2Count = 0
  } else if (totalCount === 6) {
    row1Count = 3
    row2Count = 3
  } else if (totalCount === 7) {
    row1Count = 3
    row2Count = 4
  } else if (totalCount === 8) {
    row1Count = 3
    row2Count = 5
  } else if (totalCount === 9) {
    row1Count = 4
    row2Count = 5
  } else if (totalCount === 10) {
    row1Count = 5
    row2Count = 5
  } else {
    row1Count = Math.ceil(totalCount / 2)
    row2Count = totalCount - row1Count
  }

  let xTable = 0
  let yTable = 0

  if (cardIndex < row1Count) {
    // 第一行
    xTable = (cardIndex - (row1Count - 1) / 2) * spacingX
    yTable = row2Count > 0 ? spacingY / 2 : 0
  } else {
    // 第二行
    const rowIndex = cardIndex - row1Count
    xTable = (rowIndex - (row2Count - 1) / 2) * spacingX
    yTable = -spacingY / 2
  }

  return { xTable, yTable }
}
