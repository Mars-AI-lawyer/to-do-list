/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface Window {
  api: {
    task: {
      list: () => Promise<any[]>;
      create: (input: any) => Promise<any>;
      update: (id: string, patch: any) => Promise<any>;
      delete: (ids: string[]) => Promise<boolean>;
      toggle: (id: string) => Promise<any>;
      pin: (id: string) => Promise<any>;
    };
    window: {
      expand: (mouseX?: number, mouseY?: number) => void;
      collapse: () => void;
      dragMove: (deltaX: number, deltaY: number) => void;
      onExpand: (callback: (mouseX?: number, mouseY?: number) => void) => void;
      onCollapse: (callback: () => void) => void;
    };
    onThemeChange: (callback: (isDark: boolean) => void) => void;
  };
}
