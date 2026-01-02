module.exports = {
  extends: ['alloy', 'plugin:import/recommended', 'alloy/typescript', 'plugin:import/typescript', 'alloy/vue'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    // 设置 js 的解析器为 babel-eslint
    // https://github.com/mysticatea/vue-eslint-parser#-options
    // parser: '@babel/eslint-parser',
    parser: '@typescript-eslint/parser'
  },
  env: {
    // Your environments (which contains several predefined global variables)
    //
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true,
    'vue/setup-compiler-macros': true
  },
  globals: {
    // Your global variables (setting to false means it's not allowed to be reassigned)
    //
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
    JSX: true
  },
  rules: {
    // Enforce import order
    'import/order': 'error',

    // Imports should come first
    'import/first': 'error',

    // Other import rules
    'import/no-mutable-exports': 'error',

    // Allow unresolved imports
    'import/no-unresolved': 'off',

    // Allow default import
    'import/default': 'off',
    // Customize your rules
    /**
     * html标签自闭问题
     */
    'vue/html-self-closing': [
      'error',
      {
        html: {
          normal: 'never',
          void: 'always',
          component: 'always'
        },
        svg: 'always',
        math: 'always'
      }
    ],
    /**
     * <template> <script> <style> 之间必须由空行
     */
    'vue/padding-line-between-blocks': ['error', 'always'],
    /**
     * 标签不能折行
     */
    'vue/multiline-html-element-content-newline': 'error',
    /**
     * 限制自定义组件的属性风格
     * 必须为 hyphenated
     */
    'vue/attribute-hyphenation': 'error',
    /**
     * 禁止重复的属性
     * class和style除外
     */
    'vue/no-duplicate-attributes': [
      'error',
      {
        allowCoexistClass: true,
        allowCoexistStyle: true
      }
    ],
    /**
     * 禁止在计算属性中对属性修改
     */
    'vue/no-side-effects-in-computed-properties': 'error',
    /**
     * 禁止 <template> 使用 key 属性
     */
    'vue/no-template-key': 'error',
    /**
     * 限制组件名的风格
     * 所有组件都应该PascalCase
     */
    'vue/component-name-in-template-casing': [
      'error',
      'PascalCase',
      { registeredComponentsOnly: false, ignores: ['json-viewer'] }
    ],

    'no-undef': 'off',
    'vue/multi-word-component-names': 'off'
  }
}
