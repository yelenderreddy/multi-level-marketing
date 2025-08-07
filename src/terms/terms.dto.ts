export interface CreateTermsDto {
  title: string;
  content: string;
  status?: string;
}

export interface UpdateTermsDto {
  title?: string;
  content?: string;
  status?: string;
}

export interface TermsResponseDto {
  id: number;
  title: string;
  content: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}
