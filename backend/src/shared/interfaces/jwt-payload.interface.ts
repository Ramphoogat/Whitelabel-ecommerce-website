import { UserRole } from '../../modules/identity/schemas/user.schema';

export interface JwtStaffPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
}

export interface JwtCustomerPayload {
  sub: string; // customerId
  email: string;
  role: 'customer';
}
