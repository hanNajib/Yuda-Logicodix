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
  requestAccessibilityWithPip(): boolean;
  bringToFront(): boolean;
  stopWatching(): void;
  getInstalledApps(includeIcons?: boolean): Promise<InstalledAppInfo[]>;
  getAppIcon(packageName: string): Promise<string | null>;
  isPackageInstalled(packageName: string): boolean;
  setTargetPackages(packages: string[]): boolean;
  getTargetPackages(): string[];
  setAppDetectionMode(appId: string, mode: string): boolean;
  getAppDetectionMode(appId: string): string;
  startOverlayMonitor(userName?: string, targetPackages?: string[], testMode?: boolean, intervalSeconds?: number): boolean;
  stopOverlayMonitor(): boolean;
  setIntervalMinutes(minutes: number): boolean;
  getIntervalMinutes(): number;
  isOverlayMonitorRunning(): boolean;
  isAccessibilityServiceEnabled(): boolean;
  openAccessibilitySettings(): boolean;
  getTotalReelsDurationSeconds(): number;
  dismissActiveAlert(reason?: string): boolean;
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

export function requestAccessibilityWithPip(): boolean {
  return safe(() => NativeModule?.requestAccessibilityWithPip() ?? false, false);
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

export function setTargetPackages(packages: string[]): boolean {
  return safe(() => NativeModule?.setTargetPackages(packages) ?? false, false);
}

export function getTargetPackages(): string[] {
  return safe(() => NativeModule?.getTargetPackages() ?? [], []);
}

export function setIntervalMinutes(minutes: number): boolean {
  return safe(() => NativeModule?.setIntervalMinutes(minutes) ?? false, false);
}

export function getIntervalMinutes(): number {
  return safe(() => NativeModule?.getIntervalMinutes() ?? 15, 15);
}

export function setAppDetectionMode(appId: string, mode: 'all' | 'trigger_only'): boolean {
  return safe(() => NativeModule?.setAppDetectionMode(appId, mode) ?? false, false);
}

export function getAppDetectionMode(appId: string): 'all' | 'trigger_only' {
  return safe(() => NativeModule?.getAppDetectionMode(appId) ?? 'trigger_only', 'trigger_only');
}

export function startOverlayMonitor(
  userName = 'Gathan',
  targetPackages: string[] = [
    'com.instagram.android',
    'com.zhiliaoapp.musically',
    'com.ss.android.ugc.trill',
    'com.facebook.katana',
    'com.google.android.youtube',
  ],
  testMode = true,
  intervalSeconds = 30
): boolean {
  return safe(
    () => NativeModule?.startOverlayMonitor(userName, targetPackages, testMode, intervalSeconds) ?? false,
    false
  );
}

export function stopOverlayMonitor(): boolean {
  return safe(() => NativeModule?.stopOverlayMonitor() ?? false, false);
}

export function isOverlayMonitorRunning(): boolean {
  return safe(() => NativeModule?.isOverlayMonitorRunning() ?? false, false);
}

export function isAccessibilityServiceEnabled(): boolean {
  return safe(() => NativeModule?.isAccessibilityServiceEnabled() ?? false, false);
}

export function openAccessibilitySettings(): boolean {
  return safe(() => NativeModule?.openAccessibilitySettings() ?? false, false);
}

export function getTotalReelsDurationSeconds(): number {
  return safe(() => NativeModule?.getTotalReelsDurationSeconds() ?? 0, 0);
}

export function dismissActiveAlert(reason = 'dismiss'): boolean {
  return safe(() => NativeModule?.dismissActiveAlert(reason) ?? false, false);
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
  requestAccessibilityWithPip,
  bringToFront,
  stopWatching,
  getInstalledApps,
  getAppIcon,
  isPackageInstalled,
  setTargetPackages,
  getTargetPackages,
  setAppDetectionMode,
  getAppDetectionMode,
  startOverlayMonitor,
  stopOverlayMonitor,
  setIntervalMinutes,
  getIntervalMinutes,
  isOverlayMonitorRunning,
  isAccessibilityServiceEnabled,
  openAccessibilitySettings,
  getTotalReelsDurationSeconds,
  dismissActiveAlert,
  addPipModeListener,
  addPermissionGrantedListener,
};
