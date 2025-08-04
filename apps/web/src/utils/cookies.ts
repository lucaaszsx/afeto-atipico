import { cookieSettings } from '@/constants/validation';

export const setCookie = (name: string, value: string, days: number = cookieSettings.EXPIRES_DAYS) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const isFirstVisit = (): boolean => {
  return getCookie('afetoatipico_first_visit') === null;
};

export const setFirstVisitCookie = () => {
  setCookie('afetoatipico_first_visit', 'false', cookieSettings.EXPIRES_DAYS);
};