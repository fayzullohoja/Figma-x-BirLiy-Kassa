import { UserRole } from '../types';

const ROLE_KEY = 'birliy.user.role';
const USER_NAME_KEY = 'birliy.user.name';
const USER_ID_KEY = 'birliy.user.id';
const RESTAURANT_ID_KEY = 'birliy.restaurant.id';

const DEFAULT_ROLE: UserRole = 'waiter';
const DEFAULT_USER_NAME = 'Али';
const DEFAULT_RESTAURANT_ID = '11111111-1111-1111-1111-111111111111';

export function getCurrentRole(): UserRole {
  if (typeof window === 'undefined') {
    return DEFAULT_ROLE;
  }

  const role = window.localStorage.getItem(ROLE_KEY);
  if (role === 'waiter' || role === 'owner' || role === 'admin') {
    return role;
  }

  return DEFAULT_ROLE;
}

export function setCurrentRole(role: UserRole) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ROLE_KEY, role);
}

export function getCurrentUserName() {
  if (typeof window === 'undefined') {
    return DEFAULT_USER_NAME;
  }

  return window.localStorage.getItem(USER_NAME_KEY) ?? DEFAULT_USER_NAME;
}

export function setCurrentUserName(name: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(USER_NAME_KEY, name);
}

export function getCurrentUserId() {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(USER_ID_KEY);
  if (!value) {
    return null;
  }

  return value;
}

export function setCurrentUserId(userId: string | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (userId === null) {
    window.localStorage.removeItem(USER_ID_KEY);
    return;
  }

  window.localStorage.setItem(USER_ID_KEY, userId.toString());
}

export function getRestaurantId() {
  if (typeof window === 'undefined') {
    return DEFAULT_RESTAURANT_ID;
  }

  return window.localStorage.getItem(RESTAURANT_ID_KEY) ?? DEFAULT_RESTAURANT_ID;
}

export function setRestaurantId(restaurantId: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(RESTAURANT_ID_KEY, restaurantId);
}
