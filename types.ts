export interface PromptResult {
  angle: string;
  prompt: string;
}

export enum UploadType {
  MODEL = 'Model (Reference)',
  GARMENT = 'Garment (Clothing)',
  FOOTWEAR = 'Footwear (Optional)',
  BACKGROUND = 'Background (Optional)'
}

export interface UploadSlot {
  id: string;
  type: UploadType;
  file: File | null;
  previewUrl: string | null;
}