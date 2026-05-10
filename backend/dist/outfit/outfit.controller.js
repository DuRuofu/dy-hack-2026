"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutfitController = void 0;
const common_1 = require("@nestjs/common");
const outfit_service_1 = require("./outfit.service");
const recommend_dto_1 = require("./dto/recommend.dto");
const evaluate_dto_1 = require("./dto/evaluate.dto");
let OutfitController = class OutfitController {
    constructor(outfitService) {
        this.outfitService = outfitService;
    }
    recommend(dto) {
        return this.outfitService.recommend(dto);
    }
    evaluate(dto) {
        return this.outfitService.evaluate(dto);
    }
};
exports.OutfitController = OutfitController;
__decorate([
    (0, common_1.Post)('recommend'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [recommend_dto_1.RecommendDto]),
    __metadata("design:returntype", void 0)
], OutfitController.prototype, "recommend", null);
__decorate([
    (0, common_1.Post)('evaluate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [evaluate_dto_1.EvaluateDto]),
    __metadata("design:returntype", void 0)
], OutfitController.prototype, "evaluate", null);
exports.OutfitController = OutfitController = __decorate([
    (0, common_1.Controller)('api/outfit'),
    __metadata("design:paramtypes", [outfit_service_1.OutfitService])
], OutfitController);
//# sourceMappingURL=outfit.controller.js.map