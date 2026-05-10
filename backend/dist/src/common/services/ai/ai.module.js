"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ai_interface_1 = require("./ai.interface");
const alibaba_bailian_provider_1 = require("./alibaba-bailian.provider");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: ai_interface_1.IAiProvider,
                useFactory: (config) => {
                    const provider = config.get('AI_PROVIDER', 'alibaba_bailian');
                    switch (provider) {
                        case 'alibaba_bailian':
                        default:
                            return new alibaba_bailian_provider_1.AlibabaBailianProvider(config);
                    }
                },
                inject: [config_1.ConfigService],
            },
        ],
        exports: [ai_interface_1.IAiProvider],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map