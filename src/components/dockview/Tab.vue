<template>
  <div class="tab-container">
    <p>
      {{ endpoint.params.title }}: {{ endpoint.params.random }}
      <button @click="closePanel">X</button>
    </p>
  </div>
</template>
<script lang="ts" setup name="Tab">
  import { IDockviewPanelHeaderProps } from 'dockview-vue';
  import { extractUserParams, PanelProperties } from '.';

  const props = defineProps<IDockviewPanelHeaderProps<PanelProperties>>();
  const endpoint = computed(() =>
    extractUserParams<IDockviewPanelHeaderProps<PanelProperties>>(props),
  );

  const closePanel = () => {
    endpoint.value.api.close();
  };

  onMounted(() => {
    // console.log(`tab-${endpoint.value.params.title}`, endpoint.value);
  });
</script>
<style lang="less">
  .tab-container {
    width: 100%;
    height: 100%;
  }
</style>
