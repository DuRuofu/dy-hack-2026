import { WardrobeService } from './wardrobe.service';
import { AddClothingDto } from './dto/add-clothing.dto';
import { UpdateClothingDto } from './dto/update-clothing.dto';
export declare class WardrobeController {
    private readonly wardrobeService;
    constructor(wardrobeService: WardrobeService);
    findAll(category?: string, style?: string, season?: string): Promise<{
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
