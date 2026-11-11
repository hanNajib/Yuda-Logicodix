// @ts-ignore
import { EventEmitter, Subscription, requireNativeModule } from 'expo-modules-core';

export interface InstalledAppInfo {
  packageName: string;
  appName: string;
  iconUri?: string;
}

interface YudaPipNativeModule {
  isPipSupported(): boolean;
  isInPipMode(): boolean;
  canDrawOverlays(): boolean;
  isIgnoringBatteryOptimizations(): boolean;
  enterPip(width?: number, height?: number): boolean;
  requestOverlayWithPip(): boolean;
  requestBatteryWithPip(): boolean;
  requestNotificationWithPip(): boolean;
  bringToFront(): boolean;
  stopWatching(): void;
  getInstalledApps(includeIcons?: boolean): Promise<InstalledAppInfo[]>;
  getAppIcon(packageName: string): Promise<string | null>;
  isPackageInstalled(packageName: string): boolean;
}

let NativeModule: any = null;
let emitter: EventEmitter | null = null;

try {
  NativeModule = requireNativeModule<YudaPipNativeModule>('YudaPip');
  emitter = new EventEmitter(NativeModule);
} catch {
  NativeModule = null;
  emitter = null;
}

const safe = <T>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export function isNativeModuleAvailable(): boolean {
  return NativeModule !== null;
}

export function isPipSupported(): boolean {
  return safe(() => NativeModule?.isPipSupported() ?? false, false);
}

export function isInPipMode(): boolean {
  return safe(() => NativeModule?.isInPipMode() ?? false, false);
}

export function canDrawOverlays(): boolean {
  return safe(() => NativeModule?.canDrawOverlays() ?? false, false);
}

export function isIgnoringBatteryOptimizations(): boolean {
  return safe(() => NativeModule?.isIgnoringBatteryOptimizations() ?? false, false);
}

export function enterPip(width = 16, height = 9): boolean {
  return safe(() => NativeModule?.enterPip(width, height) ?? false, false);
}

export function requestOverlayWithPip(): boolean {
  return safe(() => NativeModule?.requestOverlayWithPip() ?? false, false);
}

export function requestBatteryWithPip(): boolean {
  return safe(() => NativeModule?.requestBatteryWithPip() ?? false, false);
}

export function requestNotificationWithPip(): boolean {
  return safe(() => NativeModule?.requestNotificationWithPip() ?? false, false);
}

export function bringToFront(): boolean {
  return safe(() => NativeModule?.bringToFront() ?? false, false);
}

export function stopWatching(): void {
  safe(() => NativeModule?.stopWatching(), undefined);
}

export async function getInstalledApps(includeIcons = true): Promise<InstalledAppInfo[]> {
  if (!NativeModule?.getInstalledApps) return [];
  try {
    return await NativeModule.getInstalledApps(includeIcons);
  } catch {
    return [];
  }
}

export async function getAppIcon(packageName: string): Promise<string | null> {
  if (!NativeModule?.getAppIcon) return null;
  try {
    return await NativeModule.getAppIcon(packageName);
  } catch {
    return null;
  }
}

export function isPackageInstalled(packageName: string): boolean {
  return safe(() => NativeModule?.isPackageInstalled(packageName) ?? false, false);
}

export function addPipModeListener(
  listener: (event: { isInPip: boolean }) => void
): Subscription | undefined {
  return emitter?.addListener('onPipModeChanged', listener);
}

export function addPermissionGrantedListener(
  listener: (event: { type: string }) => void
): Subscription | undefined {
  return emitter?.addListener('onPermissionGranted', listener);
}

export default {
  isNativeModuleAvailable,
  isPipSupported,
  isInPipMode,
  canDrawOverlays,
  isIgnoringBatteryOptimizations,
  enterPip,
  requestOverlayWithPip,
  requestBatteryWithPip,
  requestNotificationWithPip,
  bringToFront,
  stopWatching,
  getInstalledApps,
  getAppIcon,
  isPackageInstalled,
  addPipModeListener,
  addPermissionGrantedListener,
};
