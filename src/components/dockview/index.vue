<template>
  <div
    ref="dockviewRef"
    class="dockview-container"
    style="width: 100vw; height: 100vh; position: relative"
  >
    <dockview-vue
      style="width: 100%; height: 100%"
      class="dockview-theme-abyss"
      @ready="onReady"
      watermark-component="watermark"
    />
  </div>
</template>
<script lang="ts" setup name="Dockview">
  import {
    DockviewApi,
    DockviewGroupPanel,
    DockviewReadyEvent,
    DockviewVue,
    DockviewWillDropEvent,
    WillShowOverlayLocationEvent,
  } from 'dockview-vue';
  import { Ref } from 'vue';
  import { nanoid } from 'nanoid';
  import Panel from './Panel.vue';
  import Tab from './Tab.vue';
  import watermark from './watermark.vue';
  import { LayoutManagement, PROVIDER_KEY } from '.';

  defineOptions({
    components: {
      Panel,
      Tab,
      watermark,
    },
  });

  const dockviewRef = ref<HTMLElement>();
  const initGroups = (api: DockviewApi) => {
    const toolbar = api.addGroup({
      hideHeader: true,
      // locked: 'no-drop-target',
      id: 'toolbar',
      direction: 'above',
    });
    api.addGroup({
      hideHeader: true,
      // locked: 'no-drop-target',
      id: 'main',
      direction: 'below',
    });
    toolbar.api.setConstraints({
      minimumHeight: 200,
      maximumHeight: 200,
    });
  };

  const initEventListeners = (api: DockviewApi) => {
    api.onWillShowOverlay((event: WillShowOverlayLocationEvent) => {
      if (event.kind === 'edge' && event.position === 'top') {
        event.preventDefault();
        return false;
      }

      if (event.group?.id === 'toolbar') {
        event.preventDefault();
        return false;
      }

      if (event.group?.id === 'main') {
        if (event.kind === 'tab') {
          event.preventDefault();
          return false;
        }
        if (event.kind === 'content') {
          if (event.position !== 'bottom') {
            event.preventDefault();
            return false;
          }
        }
      }
    });

    api.onWillDrop((event: DockviewWillDropEvent) => {
      console.log(`willDrop: kind: ${event.kind}, position: ${event.position}`);

      if (event.kind === 'edge' && event.position === 'top') {
        event.preventDefault();
        return false;
      }

      if (event.group?.id === 'main') {
        if (event.kind === 'tab') {
          event.preventDefault();
          return false;
        }
        if (event.kind === 'content') {
          if (event.position !== 'bottom') {
            event.preventDefault();
            return false;
          }
        }
      }
    });

    api.onDidAddGroup((group: DockviewGroupPanel) => {
      if (group.id === 'main') {
        return;
      }
      group.api.setConstraints({
        minimumHeight: 0,
        minimumWidth: 0,
      });

      group.api.setSize({ height: 200, width: 200 });
    });
  };

  const onReady = (event: DockviewReadyEvent) => {
    initGroups(event.api);
    initEventListeners(event.api);
    // 在 onReady 回调中，DOM 已经挂载，dockviewRef.value 确定不为 undefined
    provide(
      PROVIDER_KEY.LayoutManagement,
      new LayoutManagement(dockviewRef as Ref<HTMLElement>, event.api),
    );

    event.api.groups
      .filter((group) => group.id !== 'main')
      .forEach((group) => {
        for (let i = 0; i < 2; i++) {
          event.api.addPanel({
            id: nanoid(),
            component: 'Panel',
            tabComponent: 'Tab',
            params: {
              title: `${group.id}-tab-${i + 1}`,
            },
            position: {
              referenceGroup: group,
            },
          });
        }
      });

    // panels.value[0].group.locked = 'no-drop-target';
    // panels.value[0].group.header.hidden = true;
  };
</script>
