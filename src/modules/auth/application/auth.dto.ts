export interface LoginDto {
  email: string;
  password: string;
  tenantId: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}
