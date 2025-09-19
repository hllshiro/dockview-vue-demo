<template>
  <div class="watermark-container">
    <button @click="addPanel('left')">左侧添加面板</button>
    <button @click="addPanel('right')">右侧添加面板</button>
    <button @click="addPanel('below')">底部添加面板</button>
    <button @click="addPanel('above')">顶部添加面板</button>
  </div>
</template>
<script lang="ts" setup name="Panel">
  import { Direction, IDockviewPanelProps } from 'dockview-vue';
  import { extractUserParams } from '.';
  import { nanoid } from 'nanoid';

  const props = defineProps<IDockviewPanelProps>();
  const endpoint = computed(() => extractUserParams<IDockviewPanelProps>(props));

  const addPanel = (direction: Direction) => {
    debugger;
    endpoint.value.containerApi.addPanel({
      id: nanoid(),
      component: 'Panel',
      position: {
        referenceGroup: endpoint.value.group,
        direction,
      },
    });
  };
</script>
<style lang="less">
  .watermark-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
