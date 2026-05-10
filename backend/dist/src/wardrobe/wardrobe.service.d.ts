import { AddClothingDto } from './dto/add-clothing.dto';
import { UpdateClothingDto } from './dto/update-clothing.dto';
export declare class WardrobeService {
    private db;
    constructor(db: any);
    findAll(filters: {
        category?: string;
        style?: string;
        season?: string;
    }): Promise<{
        items: any;
    }>;
    findOne(id: number): Promise<{
        item: any;
    }>;
    add(dto: AddClothingDto): Promise<{
        id: any;
    }>;
    update(id: number, dto: UpdateClothingDto): Promise<{
        success: boolean;
    }>;
}
