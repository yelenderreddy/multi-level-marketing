export interface CreatePrivacyDto {
  title: string;
  content: string;
  status?: string;
}

export interface UpdatePrivacyDto {
  title?: string;
  content?: string;
  status?: string;
}

export interface PrivacyResponseDto {
  id: number;
  title: string;
  content: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}
