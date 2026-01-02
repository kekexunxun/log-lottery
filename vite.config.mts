import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [
      vue(),
      legacy(),
      Components({
        // components located in src/components will be imported automatically
        dirs: ['src/components'],
        // setting file located in src/components.d.ts
        dts: 'src/components.d.ts',
        types: [{ from: 'vue-router', names: ['RouterLink', 'RouterView'] }],
        include: [/\.vue$/, /\.vue\?vue/],
        exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/]
      }),
      tailwindcss()
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@@': resolve(__dirname)
      }
    }
  }
})
