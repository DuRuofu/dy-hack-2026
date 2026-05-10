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
exports.WardrobeController = void 0;
const common_1 = require("@nestjs/common");
const wardrobe_service_1 = require("./wardrobe.service");
const add_clothing_dto_1 = require("./dto/add-clothing.dto");
const update_clothing_dto_1 = require("./dto/update-clothing.dto");
let WardrobeController = class WardrobeController {
    constructor(wardrobeService) {
        this.wardrobeService = wardrobeService;
    }
    findAll(category, style, season) {
        return this.wardrobeService.findAll({ category, style, season });
    }
    findOne(id) {
        return this.wardrobeService.findOne(id);
    }
    add(dto) {
        return this.wardrobeService.add(dto);
    }
    update(id, dto) {
        return this.wardrobeService.update(id, dto);
    }
};
exports.WardrobeController = WardrobeController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('style')),
    __param(2, (0, common_1.Query)('season')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], WardrobeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], WardrobeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_clothing_dto_1.AddClothingDto]),
    __metadata("design:returntype", void 0)
], WardrobeController.prototype, "add", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_clothing_dto_1.UpdateClothingDto]),
    __metadata("design:returntype", void 0)
], WardrobeController.prototype, "update", null);
exports.WardrobeController = WardrobeController = __decorate([
    (0, common_1.Controller)('api/wardrobe'),
    __metadata("design:paramtypes", [wardrobe_service_1.WardrobeService])
], WardrobeController);
//# sourceMappingURL=wardrobe.controller.js.map