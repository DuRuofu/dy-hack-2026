export declare class ScenesService {
    private db;
    constructor(db: any);
    findAll(): Promise<{
        scenes: any;
    }>;
}
