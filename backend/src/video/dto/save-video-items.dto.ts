export class SaveVideoItemsDto {
  items: {
    image_base64: string;
    category: string;
    color?: string;
    style?: string;
    season?: string;
    name?: string;
  }[];
}
