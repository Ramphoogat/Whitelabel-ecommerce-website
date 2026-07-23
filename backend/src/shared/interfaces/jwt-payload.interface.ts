import { UserRole } from '../../modules/identity/schemas/user.schema';

export interface JwtStaffPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
  allowedSections: string[] | null;
}

export interface JwtCustomerPayload {
  sub: string; // customerId
  email: string;
  role: 'customer';
}
