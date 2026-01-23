# Model Switching and Translation Layer - Implementation Notes

## Problem Statement

The model switcher wasn't working properly at quota cutoff for agents. The issues were:

1. **Hardcoded threshold in oh-my-opencode.ts**: Used 0.2 (20%) instead of configurable `quotaThreshold` (default: 2%)
2. **Model name mismatch**: API returns names like `MODEL_CLAUDE_4_5_SONNET_THINKING` but users see `antigravity-claude-sonnet-4-5-thinking-high`
3. **No translation layer for toaster**: Notifications showed raw API model names instead of user-friendly names

## Solution Implemented

### 1. Model Name Translation Utility (`src/utils/model-name-translator.ts`)

Created a comprehensive translation layer that:

**Handles multiple formats:**
- API names: `MODEL_CLAUDE_4_5_SONNET_THINKING` → `Claude 4.5 Sonnet (Thinking)`
- User config names: `antigravity-gemini-3-pro-high` → `Gemini 3 Pro (High)`
- Internal names: `gemini-3-flash-low` → `Gemini 3 Flash (Low)`

**Key functions:**
- `translateModelName(modelName: string)`: Main translation function
- `getShortModelName(modelName: string)`: Returns name without tier suffixes
- `formatModelQuotaForToast(modelName: string, percentage: number)`: Formats for toaster display with emoji
- `formatModelSwitchMessage(from: string, to: string, reason: string)`: Formats switch notifications

**Translation logic:**
1. Direct mapping via `API_TO_DISPLAY_NAMES` dictionary
2. Pattern matching for common formats (Gemini 3.x, Claude, GPT)
3. Generic fallback: capitalize and format with spaces

### 2. Fixed Hardcoded Threshold (`src/oh-my-opencode.ts`)

**Before:**
```typescript
if (quotaState && quotaState.quotaFraction < 0.2) {  // Hardcoded 20%!
```

**After:**
```typescript
export function createOhMyOpenCodeIntegration(
  quotaManager: QuotaManager,
  config?: { defaultModel?: string; quotaThreshold?: number }
) {
  const quotaThreshold = config?.quotaThreshold ?? 0.02;  // Defaults to 2%
  
  // ...
  if (quotaState && quotaState.quotaFraction < quotaThreshold) {
```

Now respects the configurable threshold from `~/.config/opencode/quota.json`.

### 3. Enhanced Toaster Notifications (`src/plugin.ts`)

**Before:**
```
🔴 Quota: 15% (Cutoff: 2%)
Model: MODEL_CLAUDE_4_5_SONNET_THINKING
```

**After:**
```
Claude 4.5 Sonnet (Thinking)
🟢 Claude 4.5 Sonnet (Thinking): 67% (Cutoff: 2%)
```

**Improvements:**
- Uses `translateModelName()` for user-friendly title
- Uses `formatModelQuotaForToast()` for formatted message with emoji
- Dynamic variant based on threshold:
  - `critical`: quota ≤ threshold
  - `warning`: quota ≤ threshold × 2
  - `info`: quota > threshold × 2

### 4. Exported Public API (`src/index.ts`)

Added exports for external use:
```typescript
export {
  translateModelName,
  getShortModelName,
  formatModelQuotaForToast,
  formatModelSwitchMessage,
} from './utils/model-name-translator';
```

## How It Works Now

### Agent Execution Flow

1. **Agent starts** (e.g., `librarian`, `oracle`, `frontend-ui-ux-engineer`)
2. **oh-my-opencode integration checks quota**:
   - Calls `getModelForAgent(agentName, preferredModel)`
   - Checks if `quotaFraction < quotaThreshold` (default: 2%)
   - If below threshold: selects fallback model via `selectBestModel()`
   - If no fallback: rotates account
3. **Agent runs with selected model**
4. **On session.idle event**:
   - Plugin refreshes quota via `QuotaCacheUpdater`
   - Shows toaster notification with translated model name

### Model Switching Trigger Points

| Event | Threshold | Action |
|-------|-----------|--------|
| Quota drops below 2% | `quotaThreshold` (default: 0.02) | Switch to next preferred model |
| Quota hits 0% | Hard limit | Switch model OR rotate account |
| Account exhausted | All models 0% | Rotate to next account |

### Logging

All quota checks and switches are logged to `/tmp/autopilot-YYYY-MM-DD.log`:

```
[timestamp] [INFO] [HardLimitDetector] Model below threshold | {"model":"gemini-3-pro","quotaPercentage":"1.5%","threshold":"2.0%"}
[timestamp] [INFO] [HardLimitDetector] Triggering model switch (below threshold) | {"fromModel":"gemini-3-pro","toModel":"claude-sonnet-4-5"}
```

## Testing

### Manual Testing

1. **Test threshold switching:**
   ```bash
   # Monitor logs in real-time
   tail -f /tmp/autopilot-$(date +%Y-%m-%d).log | grep "threshold\|Switching"
   ```

2. **Test translation utility:**
   ```typescript
   import { translateModelName } from 'opencode-antigravity-autopilot';
   
   console.log(translateModelName('MODEL_CLAUDE_4_5_SONNET_THINKING'));
   // Output: "Claude 4.5 Sonnet (Thinking)"
   
   console.log(translateModelName('antigravity-gemini-3-pro-high'));
   // Output: "Gemini 3 Pro (High)"
   ```

3. **Test toaster notifications:**
   - Trigger session.idle event (wait for inactivity or use OpenCode idle detection)
   - Check toaster shows: `<ModelName>` with `🟢/🟡/🔴 <percentage>% (Cutoff: 2%)`

### Automated Testing (TODO)

Remaining tasks in todo list:
- [ ] Test model switching with real quota exhaustion scenarios
- [ ] Verify logs show proper model switching at cutoff threshold for agents

## Configuration

Users can configure the threshold in `~/.config/opencode/quota.json`:

```json
{
  "quotaThreshold": 0.02,
  "preferredModels": [
    "antigravity-gemini-3-pro-high",
    "antigravity-claude-sonnet-4-5",
    "antigravity-gemini-3-flash"
  ],
  "autoRotate": true
}
```

## Known Limitations

1. **No mid-execution switching**: Agents don't check quota during execution, only before starting
2. **No agent-specific thresholds**: All agents use the same `quotaThreshold`
3. **Translation coverage**: Some newer models might not have explicit mappings (falls back to generic formatting)

## Future Improvements

1. **Mid-execution quota checking**: Long-running agents (oracle, explore) should check quota periodically
2. **Agent-specific configuration**: Allow different thresholds per agent type
3. **Real-time model switch notifications**: Show toaster when model switch happens (not just on idle)
4. **Quota prediction**: Warn users before hitting cutoff based on usage patterns
5. **Model availability tracking**: Cache which models are available to avoid redundant API calls

## Related Files

- `src/utils/model-name-translator.ts` - Translation utility (NEW)
- `src/oh-my-opencode.ts` - Agent integration with quota checking (MODIFIED)
- `src/plugin.ts` - Plugin hooks and toaster notifications (MODIFIED)
- `src/index.ts` - Public API exports (MODIFIED)
- `src/rotation/HardLimitDetector.ts` - Core quota detection logic (UNCHANGED)
- `../opencode-antigravity-auth/src/plugin/transform/model-resolver.ts` - Reference for model aliases

## Build & Deploy

```bash
npm run build          # Compile TypeScript
npm link              # Link for local testing
# OR
npm publish           # Publish to npm
```

## Monitoring

```bash
# Watch for quota exhaustion
grep -E "below threshold|exhausted" /tmp/autopilot-*.log

# Watch for model switches
grep "Triggering model switch" /tmp/autopilot-*.log

# Watch for account rotations
grep "Rotating account" /tmp/autopilot-*.log
```

---

**Implementation Date**: 2026-01-23  
**Status**: Completed - Core functionality working, testing pending
