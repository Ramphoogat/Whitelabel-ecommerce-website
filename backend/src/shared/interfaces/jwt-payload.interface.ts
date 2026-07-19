import { UserRole } from '../../modules/identity/schemas/user.schema';

export interface JwtStaffPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
}
