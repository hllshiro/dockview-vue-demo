<template>
  <div class="panel-container">
    <p style="color: white">{{ endpoint.params.title }}</p>
    <p :style="{ color: isActive ? 'green' : 'red' }"> 状态: {{ isActive ? '激活' : '未激活' }} </p>
    <button @click="logGroups">输出所有组</button>
    <button @click="addPanel('left')">左侧添加面板</button>
    <button @click="addPanel('right')">右侧添加面板</button>
    <button @click="addPanel('below')">底部添加面板</button>
  </div>
</template>
<script lang="ts" setup name="Panel">
  import { Direction, IDockviewPanelProps } from 'dockview-vue';
  import { extractUserParams, ILayoutManagement, PanelProperties, PROVIDER_KEY } from '.';

  const props = defineProps<IDockviewPanelProps<PanelProperties>>();
  const endpoint = computed(() => extractUserParams<IDockviewPanelProps<PanelProperties>>(props));

  const isActive = ref(false);

  const logGroups = () => {
    console.log(endpoint.value.containerApi.groups);
  };

  const layoutManagement: ILayoutManagement | undefined = inject(PROVIDER_KEY.LayoutManagement);
  const addPanel = (position: Direction) => {
    if (layoutManagement == null) {
      console.error('没有找到LayoutManagement');
      return;
    }
    layoutManagement.addPanel(position);
  };

  onMounted(() => {
    // console.log(`panel-${endpoint.value.params.title}`, endpoint.value);

    isActive.value = endpoint.value.api.isActive;
    const disposable = endpoint.value.api.onDidActiveChange((event) => {
      isActive.value = event.isActive;
    });

    return () => {
      disposable.dispose();
    };
  });
</script>
<style lang="less">
  .panel-container {
    width: 100%;
    height: 100%;
  }
</style>
