// Security utilities for input validation and rate limiting

// ─── Input Sanitization ───
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets (XSS)
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().replace(/[<>"']/g, '');
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^0-9+\-() ]/g, '').trim();
}

// ─── Validation ───
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 255;
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^01[3-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/[^0-9]/g, ''));
}

export function isStrongPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 6) return { valid: false, message: 'Password must be at least 6 characters.' };
  if (password.length > 128) return { valid: false, message: 'Password cannot be more than 128 characters.' };
  if (!/[a-zA-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one letter.' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one number.' };
  return { valid: true, message: '' };
}

export function isValidName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 100;
}

// ─── Rate Limiting ───
const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil: number }>();

const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 5 * 60 * 1000; // 5 minutes
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

export function checkLoginRateLimit(email: string): { allowed: boolean; message: string; remainingTime?: number } {
  const key = email.toLowerCase().trim();
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record) return { allowed: true, message: '' };

  // Check if locked
  if (record.lockedUntil > now) {
    const remaining = Math.ceil((record.lockedUntil - now) / 60000);
    return {
      allowed: false,
      message: `Too many failed attempts। ${remaining} Try again after {n} minutes।`,
      remainingTime: remaining,
    };
  }

  // Reset if window expired
  if (now - record.lastAttempt > ATTEMPT_WINDOW) {
    loginAttempts.delete(key);
    return { allowed: true, message: '' };
  }

  return { allowed: true, message: '' };
}

export function recordLoginAttempt(email: string, success: boolean): void {
  const key = email.toLowerCase().trim();
  const now = Date.now();

  if (success) {
    loginAttempts.delete(key);
    return;
  }

  const record = loginAttempts.get(key) || { count: 0, lastAttempt: 0, lockedUntil: 0 };
  record.count += 1;
  record.lastAttempt = now;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCK_DURATION;
    record.count = 0; // Reset count after locking
  }

  loginAttempts.set(key, record);
}

// ─── XSS Protection ───
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m] || m);
}