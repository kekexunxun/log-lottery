<template>
  <div class="absolute z-10 flex flex-col items-center justify-center -translate-x-1/2 left-1/2">
    <h2
      class="pt-12 m-0 mb-12 font-mono tracking-wide text-center leading-12 header-title"
      :style="{ fontSize: `${configStore.theme.textSize * 1.5}px`, color: configStore.theme.textColor }"
    >
      {{ configStore.topTitle }}
    </h2>
    <div v-if="tableData.length <= 0" class="flex gap-3">
      <Button variant="outline" size="lg" @click="navigateToConfig"> 暂无人员信息，去导入 </Button>
      <Button variant="outline" size="lg" @click="setDefaultPersonList"> 使用默认数据 </Button>
    </div>
  </div>
  <div ref="containerRef" class="3dContainer">
    <!-- 选中菜单结构 start -->
    <div
      class="fixed bottom-12 left-0 right-0 z-50 flex justify-center"
      :class="{
        'opacity-0 translate-y-10 pointer-events-none': !canOperate,
        'left-auto! right-8! justify-end! w-auto!': currentStatus > 0
      }"
      style="
        transition:
          opacity 0.4s ease-in-out,
          transform 0.4s ease-in-out;
      "
    >
      <Transition name="fade-slide" mode="out-in">
        <div :key="currentStatus" class="flex gap-6">
          <button v-if="currentStatus === 0 && tableData.length > 0" class="btn-primary" @click="enterLottery">
            <strong>进入抽奖</strong>
            <div class="container-stars">
              <div class="stars" />
            </div>
            <div class="glow">
              <div class="circle" />
              <div class="circle" />
            </div>
          </button>

          <button v-if="currentStatus === 1" class="btn-primary" @click="startLottery">
            <strong>开始抽奖</strong>
            <div class="container-stars">
              <div class="stars" />
            </div>
            <div class="glow">
              <div class="circle" />
              <div class="circle" />
            </div>
          </button>

          <button v-if="currentStatus === 2" class="btn-primary" @click="stopLottery">
            <strong>选中幸运儿</strong>
            <div class="container-stars">
              <div class="stars" />
            </div>
            <div class="glow">
              <div class="circle" />
              <div class="circle" />
            </div>
          </button>

          <template v-if="currentStatus === 3">
            <button class="btn-primary" @click="continueLottery">
              <strong>继续抽奖</strong>
              <div class="container-stars">
                <div class="stars" />
              </div>
              <div class="glow">
                <div class="circle" />
                <div class="circle" />
              </div>
            </button>

            <button class="btn-secondary" @click="quitLottery">
              <strong>退出抽奖</strong>
              <div class="container-stars">
                <div class="stars" />
              </div>
              <div class="glow">
                <div class="circle" />
                <div class="circle" />
              </div>
            </button>
          </template>
        </div>
      </Transition>
    </div>
    <!-- end -->
  </div>
  <StarsBackground />
  <PrizeList />
</template>

<script setup lang="ts">
import type { IPersonConfig } from '@/types'
import type { Material } from 'three'
import { Button } from '@/components/ui/button'
import { useElementPosition, useElementStyle } from '@/hooks/useElement'
import { useConfigStore, usePersonStore, usePriceStore } from '@/store'
import { filterData, selectCard } from '@/utils'
import { rgba } from '@/utils/color'
import * as TWEEN from '@tweenjs/tween.js'
import confetti from 'canvas-confetti'
import { Object3D, PerspectiveCamera, Scene, Vector3 } from 'three'
import { CSS3DObject, CSS3DRenderer } from 'three-css3d'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import PrizeList from './PrizeList.vue'

const router = useRouter()
const configStore = useConfigStore()
const personStore = usePersonStore()
const priceStore = usePriceStore()

const tableData = ref<any[]>([])
const currentStatus = ref(0) // 0为初始状态， 1为抽奖准备状态，2为抽奖中状态，3为抽奖结束状态
const ballRotationY = ref(0)
const containerRef = ref<HTMLElement>()
const canOperate = ref(true)
const cameraZ = ref(3000)
const animationFrameId = ref<any>(null)

const scene = ref()
const camera = ref()
const renderer = ref()
const controls = ref()
const objects = ref<any[]>([])
interface TargetType {
  grid: any[]
  helix: any[]
  table: any[]
  sphere: any[]
}
const targets: TargetType = {
  grid: [],
  helix: [],
  table: [],
  sphere: []
}

const luckyTargets = ref<any[]>([])
const luckyCardList = ref<number[]>([])
const luckyCount = ref(10)
const personPool = ref<IPersonConfig[]>([])

const intervalTimer = ref<any>(null)
// 填充数据，填满七行
function initTableData() {
  if (personStore.allPersonList.length <= 0) {
    return
  }
  const totalCount = configStore.rowCount * 7
  const originPersonData = JSON.parse(JSON.stringify(personStore.allPersonList))
  const originPersonLength = originPersonData.length
  if (originPersonLength < totalCount) {
    const repeatCount = Math.ceil(totalCount / originPersonLength)
    // 复制数据
    for (let i = 0; i < repeatCount; i++) {
      tableData.value = tableData.value.concat(JSON.parse(JSON.stringify(originPersonData)))
    }
  } else {
    tableData.value = originPersonData.slice(0, totalCount)
  }
  tableData.value = filterData(tableData.value.slice(0, totalCount), configStore.rowCount)
}
function init() {
  const felidView = 40
  const width = window.innerWidth
  const height = window.innerHeight
  const aspect = width / height
  const nearPlane = 1
  const farPlane = 10000
  const WebGLoutput = containerRef.value

  scene.value = new Scene()
  camera.value = new PerspectiveCamera(felidView, aspect, nearPlane, farPlane)
  camera.value.position.z = cameraZ.value
  renderer.value = new CSS3DRenderer()
  renderer.value.setSize(width, height * 0.9)
  renderer.value.domElement.style.position = 'absolute'
  // 垂直居中
  renderer.value.domElement.style.paddingTop = '50px'
  renderer.value.domElement.style.top = '50%'
  renderer.value.domElement.style.left = '50%'
  renderer.value.domElement.style.transform = 'translate(-50%, -50%)'
  WebGLoutput!.appendChild(renderer.value.domElement)

  controls.value = new TrackballControls(camera.value, renderer.value.domElement)
  controls.value.rotateSpeed = 1
  controls.value.staticMoving = true
  controls.value.minDistance = 500
  controls.value.maxDistance = 6000
  controls.value.addEventListener('change', render)

  const tableLen = tableData.value.length
  for (let i = 0; i < tableLen; i++) {
    let element = document.createElement('div')
    element.className = 'element-card'

    if (configStore.isShowAvatar) {
      const nameEl = document.createElement('div')
      nameEl.className = 'card-name'
      // symbol.textContent = tableData.value[i].name
      nameEl.className = 'card-name card-avatar-name'
      element.appendChild(nameEl)

      const avatarEl = document.createElement('img')
      avatarEl.className = 'card-avatar'
      // avatar.src = tableData.value[i].avatar
      avatarEl.alt = 'avatar'
      avatarEl.style.width = '140px'
      avatarEl.style.height = '140px'
      element.appendChild(avatarEl)
    } else {
      const uidEl = document.createElement('div')
      uidEl.className = 'card-id'
      // number.textContent = tableData.value[i].uid
      element.appendChild(uidEl)

      const nameEl = document.createElement('div')
      nameEl.className = 'card-name'
      // symbol.textContent = tableData.value[i].name
      element.appendChild(nameEl)

      const detail = document.createElement('div')
      detail.className = 'card-detail'
      detail.innerHTML = `${tableData.value[i].department}<br/>${tableData.value[i].identity}`
      element.appendChild(detail)
    }

    element = useElementStyle({ element, person: tableData.value[i], index: i })
    const object = new CSS3DObject(element)
    object.position.x = Math.random() * 4000 - 2000
    object.position.y = Math.random() * 4000 - 2000
    object.position.z = Math.random() * 4000 - 2000
    scene.value.add(object)

    objects.value.push(object)
  }

  createTableVertices()
  createSphereVertices()
  createHelixVertices()

  function createTableVertices() {
    const tableLen = tableData.value.length
    const width = configStore.theme.cardWidth + 40
    const height = configStore.theme.cardHeight + 10

    for (let i = 0; i < tableLen; i++) {
      const object = new Object3D()

      object.position.x = tableData.value[i].x * width - ((configStore.rowCount - 1) * width) / 2
      object.position.y = -tableData.value[i].y * height + 3 * height
      object.position.z = 0

      targets.table.push(object)
    }
  }

  function createSphereVertices() {
    let i = 0
    const objLength = objects.value.length
    const vector = new Vector3()

    for (; i < objLength; ++i) {
      const phi = Math.acos(-1 + (2 * i) / objLength)
      const theta = Math.sqrt(objLength * Math.PI) * phi
      const object = new Object3D()

      object.position.x = 800 * Math.cos(theta) * Math.sin(phi)
      object.position.y = 800 * Math.sin(theta) * Math.sin(phi)
      object.position.z = -800 * Math.cos(phi)

      // rotation object

      vector.copy(object.position).multiplyScalar(2)
      object.lookAt(vector)
      targets.sphere.push(object)
    }
  }
  function createHelixVertices() {
    let i = 0
    const vector = new Vector3()
    const objLength = objects.value.length
    for (; i < objLength; ++i) {
      const phi = i * 0.213 + Math.PI

      const object = new Object3D()

      object.position.x = 800 * Math.sin(phi)
      object.position.y = -(i * 8) + 450
      object.position.z = 800 * Math.cos(phi + Math.PI)

      object.scale.set(1.1, 1.1, 1.1)

      vector.x = object.position.x * 2
      vector.y = object.position.y
      vector.z = object.position.z * 2

      object.lookAt(vector)

      targets.helix.push(object)
    }
  }
  window.addEventListener('resize', onWindowResize, false)
  transform(targets.table, 1000)
  render()
}

function transform(targets: any[], duration: number) {
  TWEEN.removeAll()
  if (intervalTimer.value) {
    clearInterval(intervalTimer.value)
    intervalTimer.value = null
    randomBallData('sphere')
  }

  return new Promise((resolve) => {
    const objLength = objects.value.length
    for (let i = 0; i < objLength; ++i) {
      const object = objects.value[i]
      const target = targets[i]
      new TWEEN.Tween(object.position)
        .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start()

      new TWEEN.Tween(object.rotation)
        .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start()
        .onComplete(() => {
          if (luckyCardList.value.length) {
            luckyCardList.value.forEach((cardIndex: any) => {
              const item = objects.value[cardIndex]
              useElementStyle({ element: item.element, index: i, mod: 'sphere' })
            })
          }
          luckyTargets.value = []
          luckyCardList.value = []
        })
    }

    // 这个补间用来在位置与旋转补间同步执行，通过onUpdate在每次更新数据后渲染scene和camera
    new TWEEN.Tween({})
      .to({}, duration * 2)
      .onUpdate(render)
      .start()
      .onComplete(() => {
        resolve('')
      })
  })
}
function onWindowResize() {
  camera.value.aspect = window.innerWidth / window.innerHeight
  camera.value.updateProjectionMatrix()

  renderer.value.setSize(window.innerWidth, window.innerHeight)
  render()
}

/**
 * [animation update all tween && controls]
 */
function animation() {
  TWEEN.update()
  if (controls.value) {
    controls.value.update()
  }
  // 设置自动旋转
  // 设置相机位置
  animationFrameId.value = requestAnimationFrame(animation)
}

// // 旋转的动画
function rollBall(rotateY: number, duration: number) {
  TWEEN.removeAll()

  return new Promise((resolve) => {
    scene.value.rotation.y = 0
    ballRotationY.value = Math.PI * rotateY * 1000
    const rotateObj = new TWEEN.Tween(scene.value.rotation)
    rotateObj
      .to({ x: 0, y: ballRotationY.value, z: 0 }, duration * 1000)
      .onUpdate(render)
      .start()
      .onStop(() => {
        resolve('')
      })
      .onComplete(() => {
        resolve('')
      })
  })
}
// 将视野转回正面
function resetCamera() {
  new TWEEN.Tween(camera.value.position)
    .to({ x: 0, y: 0, z: 3000 }, 1000)
    .onUpdate(render)
    .start()
    .onComplete(() => {
      new TWEEN.Tween(camera.value.rotation)
        .to({ x: 0, y: 0, z: 0 }, 1000)
        .onUpdate(render)
        .start()
        .onComplete(() => {
          canOperate.value = true
          // camera.value.lookAt(scene.value.position)
          camera.value.position.y = 0
          camera.value.position.x = 0
          camera.value.position.z = 3000
          camera.value.rotation.x = 0
          camera.value.rotation.y = 0
          camera.value.rotation.z = -0
          controls.value.reset()
        })
    })
}

function render() {
  if (renderer.value) {
    renderer.value.render(scene.value, camera.value)
  }
}
async function enterLottery() {
  if (!canOperate.value) {
    return
  }
  if (!intervalTimer.value) {
    randomBallData()
  }
  if (configStore.theme.patternList.length) {
    for (let i = 0; i < configStore.theme.patternList.length; i++) {
      if (i < configStore.rowCount * 7) {
        objects.value[configStore.theme.patternList[i] - 1].element.style.backgroundColor = rgba(
          configStore.theme.cardColor,
          0.5
        )
      }
    }
  }
  canOperate.value = false
  await transform(targets.sphere, 1000)
  currentStatus.value = 1
  // 确保状态更新后再显示按钮
  nextTick(() => {
    canOperate.value = true
  })
  rollBall(0.1, 2000)
}
// 开始抽奖
async function startLottery() {
  if (!canOperate.value) {
    return
  }
  // 验证是否已抽完全部奖项
  if (priceStore.currentPrize.isUsed || !priceStore.currentPrize) {
    toast.warning('所有奖项已抽完')
    return
  }
  personPool.value = priceStore.currentPrize.isAll
    ? personStore.getNotThisPrizePersonList()
    : personStore.getNotPersonList()
  // 验证抽奖人数是否还够
  if (personPool.value.length < priceStore.currentPrize.count - priceStore.currentPrize.isUsedCount) {
    toast.warning('剩余人员不足')
    return
  }

  canOperate.value = false
  luckyCount.value = 10
  // 自定义抽奖个数

  let leftover = priceStore.currentPrize.count - priceStore.currentPrize.isUsedCount
  const customCount = priceStore.currentPrize.separateCount
  if (customCount && customCount.enable && customCount.countList.length > 0) {
    for (let i = 0; i < customCount.countList.length; i++) {
      if (customCount.countList[i].isUsedCount < customCount.countList[i].count) {
        leftover = customCount.countList[i].count - customCount.countList[i].isUsedCount
        break
      }
    }
  }
  luckyCount.value = leftover < luckyCount.value ? leftover : luckyCount.value
  for (let i = 0; i < luckyCount.value; i++) {
    if (personPool.value.length > 0) {
      // 解决随机元素概率过于不均等问题
      const randomIndex = Math.floor(Math.random() * (personPool.value.length - 1))
      luckyTargets.value.push(personPool.value[randomIndex])
      personPool.value.splice(randomIndex, 1)
    }
  }

  toast.success(`现在抽取${priceStore.currentPrize.name} ${leftover}人`)
  currentStatus.value = 2
  rollBall(10, 3000)

  // 延迟显示“选中幸运儿”按钮，等待 Three.js 动画进入稳定状态
  setTimeout(() => {
    canOperate.value = true
  }, 1000)
}

async function stopLottery() {
  if (!canOperate.value) {
    return
  }
  //   clearInterval(intervalTimer.value)
  //   intervalTimer.value = null
  canOperate.value = false
  rollBall(0, 1)

  // const windowSize = { width: window.innerWidth, height: window.innerHeight }
  luckyTargets.value.forEach((person: IPersonConfig, index: number) => {
    const cardIndex = selectCard(luckyCardList.value, tableData.value.length, person.id)
    luckyCardList.value.push(cardIndex)
    const totalLuckyCount = luckyTargets.value.length
    const item = objects.value[cardIndex]
    const { xTable, yTable } = useElementPosition(
      totalLuckyCount,
      { width: configStore.theme.cardWidth * 2, height: configStore.theme.cardHeight * 2 },
      index
    )
    new TWEEN.Tween(item.position)
      .to({ x: xTable, y: yTable, z: 1000 }, 1200)
      .easing(TWEEN.Easing.Exponential.InOut)
      .onStart(() => {
        item.element = useElementStyle({
          element: item.element,
          person,
          index: cardIndex,
          mod: 'lucky',
          textSize: configStore.theme.textSize * 2,
          cardSize: { width: configStore.theme.cardWidth * 2, height: configStore.theme.cardHeight * 2 }
        })
      })
      .start()
      .onComplete(() => {
        currentStatus.value = 3
        nextTick(() => {
          canOperate.value = true
        })
      })
    new TWEEN.Tween(item.rotation)
      .to({ x: 0, y: 0, z: 0 }, 900)
      .easing(TWEEN.Easing.Exponential.InOut)
      .start()
      .onComplete(() => {
        confettiFire()
        resetCamera()
      })
  })
}
// 继续
async function continueLottery() {
  if (!canOperate.value) {
    return
  }

  const customCount = priceStore.currentPrize.separateCount
  if (customCount && customCount.enable && customCount.countList.length > 0) {
    for (let i = 0; i < customCount.countList.length; i++) {
      if (customCount.countList[i].isUsedCount < customCount.countList[i].count) {
        customCount.countList[i].isUsedCount += luckyCount.value
        break
      }
    }
  }
  priceStore.currentPrize.isUsedCount += luckyCount.value
  luckyCount.value = 0
  if (priceStore.currentPrize.isUsedCount >= priceStore.currentPrize.count) {
    priceStore.currentPrize.isUsed = true
    priceStore.currentPrize.isUsedCount = priceStore.currentPrize.count
  }
  personStore.addAlreadyPersonList(luckyTargets.value, priceStore.currentPrize)
  priceStore.updatePrizeConfig(priceStore.currentPrize)
  await enterLottery()
}
async function quitLottery() {
  canOperate.value = false
  await transform(targets.table, 1000)
  currentStatus.value = 0
  nextTick(() => {
    canOperate.value = true
  })
}
// 庆祝动画
function confettiFire() {
  const duration = 3 * 1000
  const end = Date.now() + duration
  ;(function frame() {
    // launch a few confetti from the left edge
    confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 } })
    // and launch a few from the right edge
    confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 } })

    // keep going until we are out of time
    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()
  centerFire(0.25, { spread: 26, startVelocity: 55 })
  centerFire(0.2, { spread: 60 })
  centerFire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
  centerFire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  centerFire(0.1, { spread: 120, startVelocity: 45 })
}
function centerFire(particleRatio: number, opts: any) {
  const count = 200
  confetti({
    origin: { y: 0.7 },
    ...opts,
    particleCount: Math.floor(count * particleRatio)
  })
}

function setDefaultPersonList() {
  personStore.setDefaultPersonList()
  // 刷新页面
  window.location.reload()
}
// 随机替换数据
function randomBallData(mod: 'default' | 'lucky' | 'sphere' = 'default') {
  // 两秒执行一次
  intervalTimer.value = setInterval(() => {
    // 产生随机数数组
    const indexLength = 4
    const cardRandomIndexArr: number[] = []
    const personRandomIndexArr: number[] = []
    for (let i = 0; i < indexLength; i++) {
      // 解决随机元素概率过于不均等问题
      const randomCardIndex = Math.floor(Math.random() * (tableData.value.length - 1))
      const randomPersonIndex = Math.floor(Math.random() * (personStore.allPersonList.length - 1))
      if (luckyCardList.value.includes(randomCardIndex)) {
        continue
      }
      cardRandomIndexArr.push(randomCardIndex)
      personRandomIndexArr.push(randomPersonIndex)
    }
    for (let i = 0; i < cardRandomIndexArr.length; i++) {
      if (!objects.value[cardRandomIndexArr[i]]) {
        continue
      }
      objects.value[cardRandomIndexArr[i]].element = useElementStyle({
        element: objects.value[cardRandomIndexArr[i]].element,
        person: personStore.allPersonList[personRandomIndexArr[i]],
        index: cardRandomIndexArr[i],
        mod,
        type: 'change'
      })
    }
  }, 200)
}
// 监听键盘
function listenKeyboard(e: KeyboardEvent) {
  if (!canOperate.value && e.key !== 'Escape') {
    return
  }
  if (e.key === 'Escape' && currentStatus.value === 3) {
    quitLottery()
  }
  if (e.key !== ' ') {
    return
  }
  switch (currentStatus.value) {
    case 0:
      enterLottery()
      break
    case 1:
      startLottery()
      break
    case 2:
      stopLottery()
      break
    case 3:
      continueLottery()
      break
    default:
      break
  }
}

function navigateToConfig() {
  router.push('/config/person/all')
}

function cleanup() {
  // 停止所有Tween动画
  TWEEN.removeAll()

  // 清理动画循环
  if ((window as any).cancelAnimationFrame) {
    ;(window as any).cancelAnimationFrame(animationFrameId.value)
  }
  //   animationRunning.value = false
  clearInterval(intervalTimer.value)
  intervalTimer.value = null
  if (scene.value) {
    scene.value.traverse((object: Object3D) => {
      if ((object as any).material) {
        if (Array.isArray((object as any).material)) {
          ;(object as any).material.forEach((material: Material) => {
            material.dispose()
          })
        } else {
          ;(object as any).material.dispose()
        }
      }
      if ((object as any).geometry) {
        ;(object as any).geometry.dispose()
      }
      if ((object as any).texture) {
        ;(object as any).texture.dispose()
      }
    })
    scene.value.clear()
  }

  if (objects.value) {
    objects.value.forEach((object) => {
      if (object.element) {
        object.element.remove()
      }
    })
    objects.value = []
  }

  if (controls.value) {
    controls.value.removeEventListener('change')
    controls.value.dispose()
  }
  //   移除所有事件监听
  window.removeEventListener('resize', onWindowResize)
  scene.value = null
  camera.value = null
  renderer.value = null
  controls.value = null
}
onMounted(() => {
  initTableData()
  init()
  animation()
  containerRef.value!.style.color = `${configStore.theme.textColor}`
  randomBallData()
  window.addEventListener('keydown', listenKeyboard)
})
onUnmounted(() => {
  nextTick(() => {
    cleanup()
  })
  clearInterval(intervalTimer.value)
  intervalTimer.value = null
  window.removeEventListener('keydown', listenKeyboard)
})
</script>

<style scoped lang="scss">
.header-title {
  animation: tracking-in-expand-fwd 0.8s cubic-bezier(0.215, 0.61, 0.355, 1) both;
}

.btn-primary,
.btn-secondary {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 13rem;
  height: 3.2rem;
  overflow: hidden;
  cursor: pointer;
  background-clip: content-box, border-box;
  background-origin: border-box;
  background-size: 300% 300%;
  backdrop-filter: blur(1rem);
  border: double 4px transparent;
  border-radius: 5rem;
  transition: 0.5s;
  animation: gradient-301 5s ease infinite;

  strong {
    z-index: 2;
    font-family: 'Avalors Personal Use';
    font-size: 14px;
    color: #fff;
    text-shadow: 0 0 4px white;
    letter-spacing: 2px;
  }

  &:hover {
    transform: scale(1.05);

    .container-stars {
      z-index: 1;
      background-color: #212121;
    }
  }

  &:active {
    border: double 4px #fe53bb;
    animation: none;

    .circle {
      background: #fe53bb;
    }
  }
}

.btn-primary {
  background-image:
    linear-gradient(#212121, #212121), linear-gradient(137.48deg, #ffdb3b 10%, #fe53bb 45%, #8f51ea 67%, #04f 87%);
  animation:
    gradient-301 5s ease infinite,
    pulsate 1.5s ease-in-out infinite both;
}

.btn-secondary {
  background-image:
    linear-gradient(#212121, #212121), linear-gradient(137.48deg, #666 10%, #999 45%, #444 67%, #222 87%);
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
}

.container-stars {
  position: absolute;
  z-index: -1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  backdrop-filter: blur(1rem);
  border-radius: 5rem;
  transition: 0.5s;
}

.glow {
  position: absolute;
  display: flex;
  width: 12rem;
}

.circle {
  z-index: -1;
  width: 100%;
  height: 30px;
  filter: blur(2rem);
  animation: pulse-3011 4s infinite;

  &:nth-of-type(1) {
    background: rgb(254 83 186 / 63.6%);
  }

  &:nth-of-type(2) {
    background: rgb(142 81 234 / 70.4%);
  }
}

.stars {
  position: relative;
  width: 200rem;
  height: 200rem;
  background: transparent;

  &::after {
    position: absolute;
    top: -10rem;
    left: -100rem;
    width: 100%;
    height: 100%;
    content: '';
    background-image: radial-gradient(#fff 1px, transparent 1%);
    background-size: 50px 50px;
    opacity: 0.5;
    animation: anim-star-rotate 90s linear infinite;
  }
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

/* Animations */
@keyframes anim-star-rotate {
  from {
    transform: rotate(360deg);
  }

  to {
    transform: rotate(0);
  }
}

@keyframes gradient-301 {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

@keyframes pulse-3011 {
  0% {
    box-shadow: 0 0 0 0 rgb(0 0 0 / 70%);
    transform: scale(0.75);
  }

  70% {
    box-shadow: 0 0 0 10px rgb(0 0 0 / 0%);
    transform: scale(1);
  }

  100% {
    box-shadow: 0 0 0 0 rgb(0 0 0 / 0%);
    transform: scale(0.75);
  }
}

@keyframes pulsate {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

@keyframes tracking-in-expand {
  0% {
    letter-spacing: -0.5em;
    opacity: 0;
    transform: translateZ(-700px);
  }

  40% {
    opacity: 0.6;
  }

  100% {
    opacity: 1;
    transform: translateZ(0);
  }
}
</style>
