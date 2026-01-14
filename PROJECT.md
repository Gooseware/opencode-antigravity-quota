# Project Structure

```
quota/
├── src/
│   ├── auth/
│   │   ├── TokenStorageReader.ts    # Reads V3 account storage
│   │   └── AccountRotator.ts         # Account rotation logic
│   ├── quota/
│   │   ├── LSPFinder.ts              # Finds Antigravity LSP process
│   │   └── QuotaPoller.ts            # Polls quota via LSP
│   ├── rotation/
│   │   ├── QuotaTracker.ts           # Tracks quota per model
│   │   └── ModelSelector.ts          # Selects best available model
│   ├── manager.ts                    # Main QuotaManager class
│   ├── plugin.ts                     # OpenCode plugin wrapper
│   ├── oh-my-opencode.ts             # oh-my-opencode integration
│   ├── types.ts                      # Shared TypeScript types
│   └── index.ts                      # Public API exports
├── tests/                            # Jest tests (existing)
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── LICENSE
├── README.md
└── .gitignore
```

## Integration Points

### OpenCode
- Plugin installed via `package.json` 
- Uses `AntigravityQuotaPlugin` export
- Reads from same auth storage as opencode-antigravity-auth

### oh-my-opencode
- Provides `createOhMyOpenCodeIntegration` helper
- Generates agent configs with model rotation
- Dynamic model selection based on quota

## Key Features Implemented

1. **Quota Tracking**: Real-time monitoring via LSP process
2. **Model Rotation**: Automatic fallback when quota is low
3. **Account Rotation**: Leverages multi-account from auth plugin
4. **oh-my-opencode Support**: Agent-level model management
5. **TypeScript**: Full type safety and ESM support

## Usage Examples

See README.md for complete examples including:
- Basic usage with QuotaManager
- oh-my-opencode integration
- Model rotation strategies
- API documentation
