import { QuotaManager } from './manager';
import { HardLimitDetector } from './rotation/HardLimitDetector';
import type { PluginConfig } from './types';

export function createQuotaTools(config?: PluginConfig) {
  const manager = new QuotaManager(config);
  const detector = new HardLimitDetector(config);

  return {
    quota_status: {
      description: 'Check current quota status for Antigravity models. Use detailed=true for all models.',
      args: {},
      async execute(args: { detailed?: boolean } = {}, ctx?: any) {
        await manager.initialize();

        const currentQuota = await manager.getQuotaViaApi();
        const accounts = manager['tokenReader'].getAccounts();
        const activeIndex = manager['tokenReader'].getActiveIndex();

        if (!currentQuota) {
          return 'Could not fetch quota information. Ensure opencode-antigravity-auth is configured.';
        }

        const percentage = Math.round(currentQuota.remainingFraction * 100);
        let statusIcon = '';
        let statusText = '';

        // Standardized thresholds: < 20% Critical, < 50% Warning, >= 50% Healthy
        if (percentage <= 0) {
          statusIcon = '❌';
          statusText = 'exhausted';
        } else if (percentage < 20) {
          statusIcon = '❌';
          statusText = 'critical';
        } else if (percentage < 50) {
          statusIcon = '⚠';
          statusText = 'running low';
        } else {
          statusIcon = '✓';
          statusText = 'healthy';
        }

        let output = `# Quota Status\n\n`;
        output += `${statusIcon} **Current Model:** ${currentQuota.model || 'Unknown'}\n`;
        output += `**Status:** ${statusText.toUpperCase()} (${percentage}% remaining)\n`;
        output += `**Account:** ${activeIndex + 1} of ${accounts.length} active\n`;

        if (args.detailed) {
          const allQuotas = await manager.getAllQuotasViaApi();

          if (allQuotas.size > 0) {
            output += `\n## Available Models\n\n`;

            // Filter and sort models similar to opencode-antigravity-quota
            const sortedModels = Array.from(allQuotas.entries())
              .filter(([name]) => {
                const lower = name.toLowerCase();
                return !lower.startsWith('chat_') &&
                  !lower.startsWith('rev19') &&
                  !lower.includes('gemini 2.5') &&
                  !lower.includes('gemini 3 pro image');
              })
              .sort((a, b) => a[0].localeCompare(b[0]));

            for (const [modelName, quota] of sortedModels) {
              const pct = Math.round(quota.remainingFraction * 100);
              let icon = '✓';
              if (pct <= 0) icon = '❌';
              else if (pct < 20) icon = '❌';
              else if (pct < 50) icon = '⚠';

              output += `- ${icon} **${modelName}**: ${pct}%\n`;
            }
          }
        } else {
          output += `\n*Tip: Run with { detailed: true } to see all models*\n`;
        }

        return output;
      },
    },

    quota_check_model: {
      description: 'Check if a specific model has enough quota. Provide model name as argument.',
      args: {},
      async execute(args: { model: string }, ctx?: any) {
        if (!args.model) {
          return 'Error: model argument is required. Example: quota_check_model({model: "gemini-3-pro"})';
        }

        const result = await detector.checkHardLimit(args.model);

        let icon = '';
        if (result.isExhausted) {
          icon = '❌';
        } else if (result.shouldRotate) {
          icon = '⚠';
        } else {
          icon = '✓';
        }

        let output = `# Model Quota Check: ${args.model}\n\n`;
        output += `${icon} **${result.message}**\n\n`;

        if (result.shouldRotate) {
          output += `**Recommendation:** ${result.nextModel ? `Switch to ${result.nextModel}` : 'Rotate to next account'}\n\n`;
        } else {
          output += `**Status:** OK to proceed\n\n`;
        }

        if (result.isExhausted) {
          output += `⚠ This model is currently exhausted. Using it will fail.\n`;
        }

        return output;
      },
    },

    quota_rotate_account: {
      description: 'Manually rotate to the next available account when current is exhausted. Optionally provide resetTimeISO for accurate cooldown.',
      args: {},
      async execute(args?: { resetTimeISO?: string }, ctx?: any) {
        await manager.rotateAccount(args?.resetTimeISO);

        if (args?.resetTimeISO) {
          const resetDate = new Date(args.resetTimeISO);
          const now = new Date();
          const minutesUntilReset = Math.round((resetDate.getTime() - now.getTime()) / (60 * 1000));
          return `✓ Rotated to next account. Previous account will be available again at ${resetDate.toISOString()} (~${minutesUntilReset} minutes).`;
        }

        return `✓ Rotated to next account. Previous account marked as exhausted for 30 minutes.`;
      },
    },
  };
}
