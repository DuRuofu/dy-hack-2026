import { LocalDbService } from '../common/services/local-db.service';
export declare class ScenesService {
    private localDb;
    constructor(localDb: LocalDbService);
    findAll(): Promise<{
        scenes: import("../common/services/local-db.service").Scene[];
    }>;
}
