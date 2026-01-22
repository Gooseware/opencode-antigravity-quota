# Autopilot Logging Implementation - Summary

## ✅ Completed Changes

### 1. Comprehensive Logging System
- Created `src/utils/logger.ts` with file-based logging to `/tmp`
- Daily log rotation (keeps last 7 days)
- Format: `[timestamp] [level] [component] message | data`
- Outputs to both file and console for visibility

### 2. Threshold Configuration
- **Changed default from 0.2 (20%) to 0.02 (2%)**
- This means model switching occurs at 98% usage / 2% remaining
- Applied consistently across:
  - `HardLimitDetector`
  - `QuotaManager`
  - `QuotaTracker`

### 3. Instrumented Components

#### HardLimitDetector
- Logs initialization with threshold config
- Logs every quota check with percentages
- Logs threshold comparisons and decisions
- Logs model switch events with reasoning
- Logs account rotations

#### QuotaManager
- Logs initialization with account details
- Logs API quota fetch attempts and results
- Logs authentication failures and retries
- Logs account rotations
- Logs model selection outcomes

#### ModelSelector
- Logs strategy initialization
- Logs model selection decisions
- Logs preferred vs fallback model choices
- Logs when no models are available

#### QuotaTracker
- Logs quota state updates for each model
- Logs availability checks
- Logs best model selection logic
- Logs state clears

#### PluginTools
- Logs tool invocations (quota_status, quota_check_model, quota_rotate_account)
- Logs tool execution results and errors

## 📊 Log File Location

**Path**: `/tmp/autopilot-YYYY-MM-DD.log`

**Example**: `/tmp/autopilot-2026-01-22.log`

## 🧪 Testing

Verified working:
```bash
npm run build         # ✓ Build successful
npm run typecheck     # ✓ No TypeScript errors
node scripts/test-logging.js  # ✓ Logging operational
```

Log file created successfully at `/tmp/autopilot-2026-01-22.log`

## 📖 Documentation

Created `LOGGING.md` with:
- Complete usage guide
- Real-time monitoring commands
- Log analysis examples
- Troubleshooting tips
- Effectiveness metrics to track

## 🔍 Monitoring Commands

### Watch all activity:
```bash
tail -f /tmp/autopilot-$(date +%Y-%m-%d).log
```

### Filter for threshold events:
```bash
tail -f /tmp/autopilot-$(date +%Y-%m-%d).log | grep -E "threshold|Switching"
```

### See quota percentages:
```bash
tail -f /tmp/autopilot-$(date +%Y-%m-%d).log | grep "quotaPercentage"
```

## 🎯 Key Decision Points Logged

1. **Quota Fetched**: When API returns quota data
2. **Below Threshold**: When quota falls below 2%
3. **Model Switch**: When switching from one model to another
4. **Account Rotation**: When rotating to next account
5. **No Models Available**: When all models exhausted

## 📈 Effectiveness Investigation

With these logs, you can now track:
- **When switches occur** (at exactly what percentage)
- **How often** switches happen vs account rotations
- **Lead time** between warning and actual exhaustion
- **Model availability** when switches are needed
- **False positives** (unnecessary switches)
- **Edge cases** (errors, missing data, etc.)

## 🚀 Next Steps

1. Run autopilot in normal usage
2. Monitor `/tmp/autopilot-YYYY-MM-DD.log`
3. Collect data over several days
4. Analyze switch frequency and timing
5. Adjust threshold if needed (e.g., 0.05 = 5%, 0.01 = 1%)

## 📝 Files Changed

- `src/utils/logger.ts` (NEW)
- `src/rotation/HardLimitDetector.ts` (logging + threshold 0.02)
- `src/manager.ts` (logging + threshold 0.02)
- `src/rotation/ModelSelector.ts` (logging)
- `src/rotation/QuotaTracker.ts` (logging + threshold 0.02)
- `src/plugin-tools.ts` (logging)
- `scripts/test-logging.js` (NEW)
- `LOGGING.md` (NEW)

## ⚠️ Important Notes

- Logs write to `/tmp` (not persistent across reboots on some systems)
- For production, consider log aggregation service
- Default log level is `debug` (very verbose)
- Can be changed to `info` for less noise
- Logs rotate automatically after 7 days
