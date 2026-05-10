import { ScenesService } from './scenes.service';
export declare class ScenesController {
    private readonly scenesService;
    constructor(scenesService: ScenesService);
    findAll(): Promise<{
        scenes: import("../common/services/local-db.service").Scene[];
    }>;
}
