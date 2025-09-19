import { Direction, DockviewApi, DockviewGroupPanel } from 'dockview-vue';
import { nanoid } from 'nanoid';
import { InjectionKey, Ref } from 'vue';

export interface PanelProperties {
  title: string;
  random: string;
}

// dockview-vue 类型帮助函数
export function extractUserParams<T>(dockviewParams: any): T {
  return dockviewParams?.params as T;
}

export interface ILayoutManagement {
  api: DockviewApi;
  ref: Ref<HTMLElement>;
  addPanel(direction: Direction): void;
}

export class LayoutManagement implements ILayoutManagement {
  readonly api: DockviewApi;
  ref: Ref<HTMLElement>;
  constructor(ref: Ref<HTMLElement>, api: DockviewApi) {
    this.ref = ref;
    this.api = api;
  }
  addPanel(direction: Direction): void {
    // 查找符合方向需求的目标组
    const targetGroup: DockviewGroupPanel | undefined = this.findOptimalGroup(direction);

    if (targetGroup) {
      this.api.addPanel({
        id: nanoid(),
        component: 'Panel',
        tabComponent: 'Tab',
        position: {
          referenceGroup: targetGroup,
          index: targetGroup.panels.length,
        },
        params: {
          title: `Panel-${nanoid(4)}`,
          random: nanoid(8),
        },
      });
    } else {
      this.api.addPanel({
        id: nanoid(),
        component: 'Panel',
        tabComponent: 'Tab',
        position: {
          direction: direction,
        },
        params: {
          title: `Panel-${nanoid(4)}`,
          random: nanoid(8),
        },
      });
    }
  }

  /**
   * 根据方向查找最优的目标组
   * @param direction 要添加面板的方向
   * @returns 最适合的组，如果没有找到则返回 undefined
   */
  private findOptimalGroup(direction: Direction): DockviewGroupPanel | undefined {
    // 过滤掉不可用的组
    const availableGroups = this.api.groups.filter((group: DockviewGroupPanel) => {
      // 排除锁定的组（不允许添加面板）
      if (group.locked === true || group.locked === 'no-drop-target') {
        return false;
      }

      // 排除隐藏 header 的组（通常是特殊用途的组）
      if (group.header?.hidden) {
        return false;
      }

      return true;
    });

    if (availableGroups.length === 0) {
      return undefined;
    }

    // 根据方向查找匹配的组
    const directionMatchedGroups = availableGroups.filter((group: DockviewGroupPanel) => {
      return this.isGroupMatchDirection(group, direction);
    });

    // 如果有方向匹配的组，优先选择面板数量较少的
    if (directionMatchedGroups.length > 0) {
      return directionMatchedGroups.reduce((prev, current) => {
        return prev.panels.length <= current.panels.length ? prev : current;
      });
    }

    // 如果没有方向匹配的组，选择面板数量最少的可用组
    return availableGroups.reduce((prev, current) => {
      return prev.panels.length <= current.panels.length ? prev : current;
    });
  }

  /**
   * 判断组是否匹配指定方向
   * 基于所有可用组的相对位置动态判断，而不是使用固定阈值
   * @param group 要检查的组
   * @param direction 目标方向
   * @returns 是否匹配
   */
  private isGroupMatchDirection(group: DockviewGroupPanel, direction: Direction): boolean {
    const containerElement = this.ref.value;
    if (!containerElement) {
      return false;
    }

    const containerRect = containerElement.getBoundingClientRect();

    // 获取所有可用组的位置信息
    const availableGroups = this.api.groups.filter((g: DockviewGroupPanel) => {
      return (
        g.element && !(g.locked === true || g.locked === 'no-drop-target') && !g.header?.hidden
      );
    });

    if (availableGroups.length === 0) {
      return false;
    }

    // 计算所有组的位置信息
    const groupPositions = availableGroups.map((g: DockviewGroupPanel) => {
      const rect = g.element!.getBoundingClientRect();
      return {
        group: g,
        rect,
        centerX: rect.left + rect.width / 2 - containerRect.left,
        centerY: rect.top + rect.height / 2 - containerRect.top,
        left: rect.left - containerRect.left,
        right: rect.right - containerRect.left,
        top: rect.top - containerRect.top,
        bottom: rect.bottom - containerRect.top,
      };
    });

    // 找到目标组的位置信息
    const targetGroupPos = groupPositions.find((pos) => pos.group === group);
    if (!targetGroupPos) {
      return false;
    }

    switch (direction) {
      case 'left':
        // 左侧组：没有其他组在它的左边，且不是最右边的组
        return this.isLeftmostGroup(targetGroupPos, groupPositions);

      case 'right':
        // 右侧组：没有其他组在它的右边，且不是最左边的组
        return this.isRightmostGroup(targetGroupPos, groupPositions);

      case 'above':
        // 顶部组：没有其他组在它的上边，且不是最下面的组
        return this.isTopmostGroup(targetGroupPos, groupPositions);

      case 'below':
        // 底部组：没有其他组在它的下边，且不是最上面的组
        return this.isBottommostGroup(targetGroupPos, groupPositions);

      case 'within':
        // 中心区域组：四周都有其他组，或者是面积最大的组
        return this.isCenterGroup(targetGroupPos, groupPositions);

      default:
        return false;
    }
  }

  /**
   * 判断是否为最左侧的组
   */
  private isLeftmostGroup(targetPos: any, allPositions: any[]): boolean {
    const tolerance = 10; // 10px 容差

    // 检查是否有组在目标组的左侧
    const hasGroupsToLeft = allPositions.some(
      (pos) => pos !== targetPos && pos.right < targetPos.left + tolerance,
    );

    // 检查是否不是最右侧的组
    const isNotRightmost = allPositions.some(
      (pos) => pos !== targetPos && pos.left > targetPos.right - tolerance,
    );

    return !hasGroupsToLeft && isNotRightmost;
  }

  /**
   * 判断是否为最右侧的组
   */
  private isRightmostGroup(targetPos: any, allPositions: any[]): boolean {
    const tolerance = 10;

    // 检查是否有组在目标组的右侧
    const hasGroupsToRight = allPositions.some(
      (pos) => pos !== targetPos && pos.left > targetPos.right - tolerance,
    );

    // 检查是否不是最左侧的组
    const isNotLeftmost = allPositions.some(
      (pos) => pos !== targetPos && pos.right < targetPos.left + tolerance,
    );

    return !hasGroupsToRight && isNotLeftmost;
  }

  /**
   * 判断是否为最顶部的组
   */
  private isTopmostGroup(targetPos: any, allPositions: any[]): boolean {
    const tolerance = 10;

    // 检查是否有组在目标组的上方
    const hasGroupsAbove = allPositions.some(
      (pos) => pos !== targetPos && pos.bottom < targetPos.top + tolerance,
    );

    // 检查是否不是最底部的组
    const isNotBottommost = allPositions.some(
      (pos) => pos !== targetPos && pos.top > targetPos.bottom - tolerance,
    );

    return !hasGroupsAbove && isNotBottommost;
  }

  /**
   * 判断是否为最底部的组
   */
  private isBottommostGroup(targetPos: any, allPositions: any[]): boolean {
    const tolerance = 10;

    // 检查是否有组在目标组的下方
    const hasGroupsBelow = allPositions.some(
      (pos) => pos !== targetPos && pos.top > targetPos.bottom - tolerance,
    );

    // 检查是否不是最顶部的组
    const isNotTopmost = allPositions.some(
      (pos) => pos !== targetPos && pos.bottom < targetPos.top + tolerance,
    );

    return !hasGroupsBelow && isNotTopmost;
  }

  /**
   * 判断是否为中心区域的组
   */
  private isCenterGroup(targetPos: any, allPositions: any[]): boolean {
    // 如果只有一个组，那它就是中心组
    if (allPositions.length === 1) {
      return true;
    }

    // 计算目标组的面积
    const targetArea = targetPos.rect.width * targetPos.rect.height;

    // 检查是否四周都有其他组，或者是面积最大的组
    const hasGroupsOnAllSides =
      allPositions.some((pos) => pos !== targetPos && pos.right < targetPos.left) && // 左侧有组
      allPositions.some((pos) => pos !== targetPos && pos.left > targetPos.right) && // 右侧有组
      allPositions.some((pos) => pos !== targetPos && pos.bottom < targetPos.top) && // 上方有组
      allPositions.some((pos) => pos !== targetPos && pos.top > targetPos.bottom); // 下方有组

    // 检查是否是面积最大的组
    const isLargestGroup = allPositions.every((pos) => {
      if (pos === targetPos) return true;
      const posArea = pos.rect.width * pos.rect.height;
      return targetArea >= posArea;
    });

    return hasGroupsOnAllSides || isLargestGroup;
  }
}

export const PROVIDER_KEY = {
  LayoutManagement: Symbol('LayoutManagement') as InjectionKey<ILayoutManagement>,
};
