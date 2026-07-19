export interface CustomerAuthResponseDto {
  accessToken: string;
  refreshToken: string;
  customer: {
    id: string;
    email: string;
    name: string;
  };
}
