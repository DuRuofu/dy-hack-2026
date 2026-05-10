import { ScenesService } from './scenes.service';
export declare class ScenesController {
    private readonly scenesService;
    constructor(scenesService: ScenesService);
    findAll(): Promise<{
        scenes: any;
    }>;
}
