import { apiRequest } from "./client";

export interface CustomerAuthResponse {
  accessToken: string;
  refreshToken: string;
  customer: { id: string; email: string; name: string };
}

export function registerCustomer(input: { email: string; password: string; name: string; phone?: string }) {
  return apiRequest<CustomerAuthResponse>("/auth/customer/register", {
    method: "POST",
    body: input,
  });
}

export function loginCustomer(input: { email: string; password: string }) {
  return apiRequest<CustomerAuthResponse>("/auth/customer/login", {
    method: "POST",
    body: input,
  });
}

export type SocialProvider = "google" | "apple" | "facebook";

/** Third-party sign-in — creates the customer on first use, records the provider. */
export function socialLoginCustomer(input: { provider: SocialProvider; email: string; name: string }) {
  return apiRequest<CustomerAuthResponse>("/auth/customer/social", {
    method: "POST",
    body: input,
  });
}

export function logoutCustomer(refreshToken: string) {
  return apiRequest<{ success: boolean }>("/auth/customer/logout", {
    method: "POST",
    body: { refreshToken },
  });
}

export interface CustomerProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
}

export function getCustomerProfile() {
  return apiRequest<CustomerProfile>("/customer/profile", { auth: true });
}

export function updateCustomerProfile(input: { name?: string; phone?: string }) {
  return apiRequest<CustomerProfile>("/customer/profile", {
    method: "PATCH",
    body: input,
    auth: true,
  });
}

export interface CustomerAddress {
  _id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export function listAddresses() {
  return apiRequest<CustomerAddress[]>("/customer/addresses", { auth: true });
}
