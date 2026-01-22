import { QuotaManager } from '../manager';

import { QuotaInfo } from '../types';
import fs from 'fs';
import path from 'path';
import os from 'os';

interface QuotaCache {
  percentage: number;
  model: string;
  timestamp: number;
}

function getQuotaCachePath(): string {
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (xdgConfigHome) {
    return path.join(xdgConfigHome, 'opencode', 'quota-cache.json');
  }
  const homeDir = os.homedir();
  return path.join(homeDir, '.config', 'opencode', 'quota-cache.json');
}

export async function writeQuotaToCache(quota: QuotaInfo): Promise<void> {
  try {
    const cache: QuotaCache = {
      percentage: Math.round(quota.remainingFraction * 100),
      model: quota.model || 'unknown',
      timestamp: Date.now(),
    };

    const cachePath = getQuotaCachePath();
    const cacheDir = path.dirname(cachePath);

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    await fs.promises.writeFile(cachePath, JSON.stringify(cache, null, 2), 'utf-8');
    // console.log('Cache updated via writeQuotaToCache', { model: quota.model, pct: cache.percentage });
  } catch (error) {
    console.warn('Failed to write quota cache', error);
  }
}

export class QuotaCacheUpdater {
  private manager!: QuotaManager;
  private intervalId!: NodeJS.Timeout | null;
  private updateIntervalMs!: number;

  constructor(manager: QuotaManager, updateIntervalMs: number = 300000) {
    if (!(this instanceof QuotaCacheUpdater)) {
      return new (QuotaCacheUpdater as any)(manager, updateIntervalMs);
    }
    this.intervalId = null;
    this.manager = manager;
    // Enforce minimum interval of 5 minutes (300000ms) to prevent spam/throttling
    // Explicitly check for NaN or invalid values
    if (!updateIntervalMs || isNaN(updateIntervalMs) || updateIntervalMs < 300000) {
      this.updateIntervalMs = 300000;
    } else {
      this.updateIntervalMs = updateIntervalMs;
    }

    this.updateCache = this.updateCache.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  async updateCache(): Promise<void> {
    const interval = this.updateIntervalMs; // Capture here to avoid 'this' context issues in async generator/callbacks
    try {
      // console.log('QuotaCacheUpdater: method called');
      const quota = await this.manager.getQuotaViaApi();

      if (quota) {
        await writeQuotaToCache(quota);
      }
    } catch (error) {
      console.warn('Failed to update quota cache (poller)', error);
    } finally {
      // Schedule next update only after current one finishes
      // Schedule next update only after current one finishes
      if (this.intervalId !== null) { // Check null (stopped) instead of truthy
        this.intervalId = setTimeout(() => {
          this.updateCache();
        }, interval);
      }
    }
  }

  start(): void {
    if (this.intervalId) return; // Already started

    // Start strict sequence
    this.intervalId = setTimeout(() => {
      this.updateCache();
    }, 100); // Initial run after short delay
  }

  stop(): void {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }
}

export async function startQuotaCacheService(updateIntervalMs: number = 300000): Promise<QuotaCacheUpdater> {
  const manager = new QuotaManager();
  await manager.initialize();

  const updater = new QuotaCacheUpdater(manager, updateIntervalMs);
  updater.start();

  return updater;
}
