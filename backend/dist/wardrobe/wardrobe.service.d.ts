import { LocalDbService } from '../common/services/local-db.service';
import { AddClothingDto } from './dto/add-clothing.dto';
import { UpdateClothingDto } from './dto/update-clothing.dto';
export declare class WardrobeService {
    private localDb;
    constructor(localDb: LocalDbService);
    findAll(filters: {
        category?: string;
        style?: string;
        season?: string;
    }): Promise<{
        items: import("../common/services/local-db.service").ClothingItem[];
    }>;
    findOne(id: number): Promise<{
        item: import("../common/services/local-db.service").ClothingItem;
    }>;
    add(dto: AddClothingDto): Promise<{
        id: number;
    }>;
    update(id: number, dto: UpdateClothingDto): Promise<{
        success: boolean;
    }>;
}
