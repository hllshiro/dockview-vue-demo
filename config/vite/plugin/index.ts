import type { Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
// import legacy from '@vitejs/plugin-legacy';
import { autoRegistryComponents } from './component';
import { AutoImportDeps } from './autoImport';

export function createVitePlugins() {
  const vitePlugins: (Plugin | Plugin[])[] = [
    // vue支持
    vue(),
    // JSX支持
    vueJsx(),
    // 自动按需引入组件
    autoRegistryComponents(),
    // 自动按需引入依赖
    AutoImportDeps(),
  ];
  return vitePlugins;
}
