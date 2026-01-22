# Autopilot Logging & Testing Guide

This guide explains how to use the comprehensive logging system to investigate the effectiveness of the 98% threshold (2% remaining quota) for model switching.

## Overview

The autopilot plugin now includes detailed logging to `/tmp` that tracks:
- Quota checks and API calls
- Threshold evaluations (98% usage / 2% remaining)
- Model selection decisions
- Account rotations
- All decision points in the switching logic

## Log File Location

**Default**: `/tmp/autopilot-YYYY-MM-DD.log`

Example: `/tmp/autopilot-2026-01-22.log`

## Log Rotation

- Logs are rotated daily (new file each day)
- Old logs are automatically cleaned up after 7 days
- No manual maintenance required

## Configuration

### Threshold Setting

The threshold has been set to **0.02** (2% remaining quota), which means:
- Switch triggers when quota falls below 2% remaining
- This equals 98% usage
- Previously was 0.2 (20% remaining)

### Where It's Configured

The threshold is set in three places:
1. `HardLimitDetector` - Default: `0.02`
2. `QuotaManager` - Default: `0.02`
3. `QuotaTracker` - Default: `0.02`

You can override via `PluginConfig`:
```typescript
const detector = new HardLimitDetector({
  quotaThreshold: 0.02,  // 2% remaining
  preferredModels: [
    'google/antigravity-gemini-3-pro',
    'google/antigravity-claude-sonnet-4-5'
  ]
});
```

## Monitoring Logs in Real-Time

### Watch all autopilot activity:
```bash
tail -f /tmp/autopilot-$(date +%Y-%m-%d).log
```

### Filter for specific events:

**Threshold checks:**
```bash
tail -f /tmp/autopilot-$(date +%Y-%m-%d).log | grep "threshold"
```

**Model switches:**
```bash
tail -f /tmp/autopilot-$(date +%Y-%m-%d).log | grep "Switching to"
```

**API quota fetches:**
```bash
tail -f /tmp/autopilot-$(date +%Y-%m-%d).log | grep "Quota fetched"
```

**Warnings and errors only:**
```bash
tail -f /tmp/autopilot-$(date +%Y-%m-%d).log | grep -E "WARN|ERROR"
```

## Log Format

```
[timestamp] [level] [component] message | data
```

Example:
```
[2026-01-22T18:44:12.123Z] [INFO] [HardLimitDetector] Model quota healthy | {"model":"gemini-3-pro","quotaPercentage":"67.0%","threshold":"2.0%"}
```

### Log Levels

- **DEBUG**: Detailed flow information (quota checks, method calls)
- **INFO**: Important events (switches, selections, initializations)
- **WARN**: Potential issues (low quota, no alternative models)
- **ERROR**: Failures (API errors, missing accounts)

## What Gets Logged

### HardLimitDetector
- Initialization with threshold configuration
- Every quota check with current percentage
- Threshold comparisons (above/below)
- Model switch decisions with reasoning
- Account rotations

### QuotaManager
- Initialization with account info
- API quota fetches (success/failure)
- Account rotations
- Model selection results

### ModelSelector
- Strategy initialization
- Model selection attempts
- Preferred vs fallback choices
- No-model-available scenarios

### QuotaTracker
- Quota state updates for each model
- Model availability checks
- Best model selection logic
- State clears

### PluginTools
- Tool invocations (quota_status, quota_check_model, quota_rotate_account)
- Tool execution results

## Example Log Analysis

### Scenario: Model switches at 98% threshold

```bash
# Watch for the moment when quota drops below 2%
tail -f /tmp/autopilot-$(date +%Y-%m-%d).log | grep -E "below threshold|Switching to"
```

You should see:
```
[timestamp] [WARN] [HardLimitDetector] Model below threshold | {"model":"gemini-3-pro","remainingFraction":0.015,"quotaPercentage":"1.5%","threshold":0.02,"thresholdPercentage":"2.0%"}
[timestamp] [INFO] [HardLimitDetector] Triggering model switch (below threshold) | {"fromModel":"gemini-3-pro","toModel":"claude-sonnet-4-5","currentQuota":"1.5%","threshold":"2.0%","reason":"Below threshold"}
```

### Effectiveness Metrics to Track

1. **Switch Timing**: When does the switch occur relative to quota exhaustion?
2. **False Positives**: Switches when not needed
3. **Late Switches**: Switches that happened too late (quota already 0%)
4. **Model Availability**: How often is a fallback model available?
5. **Account Rotations**: How often does account rotation occur vs model switching?

## Testing the System

### Basic Test
```bash
npm run build
node scripts/test-logging.js
```

### Test with Hard Limit Detection
```bash
npm run test:quota
```

This will show quota status for all models and test the threshold logic.

## Troubleshooting

### No log file created

Check permissions:
```bash
ls -l /tmp
```

Ensure `/tmp` is writable:
```bash
touch /tmp/test && rm /tmp/test
```

### Logs not appearing in real-time

The logger writes synchronously, so logs appear immediately. If not:
1. Check if the plugin is actually running
2. Verify the log file path with: `getLogger().getLogFilePath()`
3. Check for write errors in console output

### Too many logs / noise

Change the minimum log level:
```typescript
import { getLogger, setLogger, AutopilotLogger } from './utils/logger';

const logger = new AutopilotLogger({
  minLevel: 'info'  // Only info, warn, error (skip debug)
});
setLogger(logger);
```

## Analyzing Results

After running the autopilot for a period of time:

### Count switches:
```bash
grep "Triggering model switch" /tmp/autopilot-*.log | wc -l
```

### Count threshold warnings:
```bash
grep "Model below threshold" /tmp/autopilot-*.log | wc -l
```

### See all quota percentages when switches occurred:
```bash
grep "Triggering model switch" /tmp/autopilot-*.log | grep -oP '"currentQuota":"[^"]*"'
```

### Check for exhaustion events (0% quota):
```bash
grep "exhausted (0% quota)" /tmp/autopilot-*.log
```

## Key Insights to Look For

1. **Timing**: Do switches at 2% give enough buffer before exhaustion?
2. **Coverage**: Are all critical decision points logged?
3. **Effectiveness**: Does 98% threshold prevent hitting 0%?
4. **Reliability**: Are there any unexpected errors or edge cases?

## Production Deployment

For production, consider:
- Using a log aggregation service (e.g., CloudWatch, Datadog)
- Setting `minLevel: 'info'` to reduce noise
- Archiving logs to S3 or similar for long-term analysis
- Setting up alerts for ERROR level logs

## Next Steps

1. Run autopilot with normal usage
2. Monitor `/tmp/autopilot-YYYY-MM-DD.log`
3. Collect data over several days
4. Analyze switch frequency and timing
5. Adjust threshold if needed (e.g., 0.05 = 5%, 0.01 = 1%)

## Support

For issues or questions:
- Check the log file for detailed error messages
- Review the component-specific logging in the code
- Adjust log levels for more/less detail as needed
