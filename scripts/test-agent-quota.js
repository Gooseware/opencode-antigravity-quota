"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var manager_1 = require("../src/manager");
var oh_my_opencode_1 = require("../src/oh-my-opencode");
var QuotaTracker_1 = require("../src/rotation/QuotaTracker");
// Mock QuotaManager to simulate quota states
var MockQuotaManager = /** @class */ (function (_super) {
    __extends(MockQuotaManager, _super);
    function MockQuotaManager(mockQuota, mockModel) {
        var _this = _super.call(this) || this;
        _this.mockQuota = mockQuota;
        _this.mockModel = mockModel;
        // @ts-ignore - Accessing private property for test setup
        _this.quotaTracker = new QuotaTracker_1.QuotaTracker(0.02);
        // @ts-ignore - Accessing private property for test setup
        _this.quotaTracker.updateQuota(mockModel, {
            remainingFraction: mockQuota,
            resetTime: new Date(Date.now() + 3600000).toISOString()
        });
        return _this;
    }
    // @ts-ignore - Accessing private property for test setup
    MockQuotaManager.prototype.getQuotaTracker = function () {
        return this.quotaTracker;
    };
    // @ts-ignore - Mocking method
    MockQuotaManager.prototype.selectBestModel = function () {
        return 'fallback-model';
    };
    MockQuotaManager.prototype.rotateAccount = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('Rotating account...');
                return [2 /*return*/];
            });
        });
    };
    return MockQuotaManager;
}(manager_1.QuotaManager));
function testAgentQuotaThreshold() {
    return __awaiter(this, void 0, void 0, function () {
        var TARGET_MODEL, CURRENT_QUOTA, manager1, integration1, result1, manager2, integration2, result2, manager3, integration3, result3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🧪 Testing Agent Quota Threshold Logic (TS version)...\n');
                    TARGET_MODEL = 'primary-model';
                    CURRENT_QUOTA = 0.05;
                    console.log("Context: Model '".concat(TARGET_MODEL, "' has ").concat(CURRENT_QUOTA * 100, "% quota remaining."));
                    // Test Case 1: Low Threshold (2%)
                    console.log('\n--- Test Case 1: Threshold 2% (Standard) ---');
                    manager1 = new MockQuotaManager(CURRENT_QUOTA, TARGET_MODEL);
                    integration1 = (0, oh_my_opencode_1.createOhMyOpenCodeIntegration)(manager1, {
                        defaultModel: TARGET_MODEL,
                        quotaThreshold: 0.02
                    });
                    return [4 /*yield*/, integration1.getModelForAgent('test-agent', TARGET_MODEL)];
                case 1:
                    result1 = _a.sent();
                    if (result1 === TARGET_MODEL) {
                        console.log('✅ PASS: Kept primary model (5% > 2%)');
                    }
                    else {
                        console.error("\u274C FAIL: Switched to ".concat(result1, " unexpectedly"));
                    }
                    // Test Case 2: High Threshold (10%)
                    console.log('\n--- Test Case 2: Threshold 10% (Aggressive) ---');
                    manager2 = new MockQuotaManager(CURRENT_QUOTA, TARGET_MODEL);
                    integration2 = (0, oh_my_opencode_1.createOhMyOpenCodeIntegration)(manager2, {
                        defaultModel: TARGET_MODEL,
                        quotaThreshold: 0.10
                    });
                    return [4 /*yield*/, integration2.getModelForAgent('test-agent', TARGET_MODEL)];
                case 2:
                    result2 = _a.sent();
                    if (result2 === 'fallback-model') {
                        console.log('✅ PASS: Switched to fallback model (5% < 10%)');
                    }
                    else {
                        console.error("\u274C FAIL: Kept ".concat(result2, " despite low quota"));
                    }
                    // Test Case 3: Default Threshold (Should be 2%)
                    console.log('\n--- Test Case 3: Default Threshold (Implied 2%) ---');
                    manager3 = new MockQuotaManager(CURRENT_QUOTA, TARGET_MODEL);
                    integration3 = (0, oh_my_opencode_1.createOhMyOpenCodeIntegration)(manager3, {
                        defaultModel: TARGET_MODEL
                    });
                    return [4 /*yield*/, integration3.getModelForAgent('test-agent', TARGET_MODEL)];
                case 3:
                    result3 = _a.sent();
                    if (result3 === TARGET_MODEL) {
                        console.log('✅ PASS: Kept primary model with default threshold');
                    }
                    else {
                        console.error("\u274C FAIL: Switched to ".concat(result3, " unexpectedly"));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
testAgentQuotaThreshold().catch(console.error);
