import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// Get encryption key from environment or generate one
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  
  // If the key is a hex string, convert it to buffer
  if (key.length === 64) {
    return Buffer.from(key, 'hex');
  }
  
  // Otherwise, hash the key to get a consistent 32-byte key
  return crypto.scryptSync(key, 'salt', KEY_LENGTH);
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

/**
 * Encrypt sensitive data using AES-256-GCM
 */
export function encrypt(text: string): EncryptedData {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ALGORITHM, key);
    cipher.setAAD(Buffer.from('vervidflow-aad'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data using AES-256-GCM
 */
export function decrypt(encryptedData: EncryptedData): string {
  try {
    const key = getEncryptionKey();
    const decipher = crypto.createDecipher(ALGORITHM, key);
    decipher.setAAD(Buffer.from('vervidflow-aad'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash passwords using bcrypt-compatible scrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const [saltHex, hashHex] = hash.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const originalHash = Buffer.from(hashHex, 'hex');
    
    const derivedHash = crypto.scryptSync(password, salt, 64);
    
    return crypto.timingSafeEqual(originalHash, derivedHash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate API key with specific format
 */
export function generateApiKey(prefix: string = 'vf'): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(16).toString('hex');
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Hash API key for storage
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Verify API key against hash
 */
export function verifyApiKey(apiKey: string, hash: string): boolean {
  const apiKeyHash = hashApiKey(apiKey);
  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(apiKeyHash, 'hex')
  );
}

/**
 * Encrypt PII (Personally Identifiable Information)
 */
export function encryptPII(data: any): any {
  if (typeof data === 'string') {
    return encrypt(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => encryptPII(item));
  }
  
  if (data && typeof data === 'object') {
    const encrypted: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Encrypt sensitive fields
      if (['email', 'phone', 'address', 'ssn', 'creditCard'].includes(key)) {
        encrypted[key] = typeof value === 'string' ? encrypt(value) : value;
      } else {
        encrypted[key] = value;
      }
    }
    return encrypted;
  }
  
  return data;
}

/**
 * Decrypt PII (Personally Identifiable Information)
 */
export function decryptPII(data: any): any {
  if (data && typeof data === 'object' && 'encrypted' in data) {
    return decrypt(data as EncryptedData);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => decryptPII(item));
  }
  
  if (data && typeof data === 'object') {
    const decrypted: any = {};
    for (const [key, value] of Object.entries(data)) {
      decrypted[key] = decryptPII(value);
    }
    return decrypted;
  }
  
  return data;
}

/**
 * Generate HMAC signature for webhook verification
 */
export function generateHMAC(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Verify HMAC signature
 */
export function verifyHMAC(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = generateHMAC(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: any): any {
  if (typeof data === 'string') {
    if (data.includes('@')) {
      // Email masking
      const [local, domain] = data.split('@');
      return `${local.substring(0, 2)}***@${domain}`;
    }
    if (data.match(/^\+?[\d\s\-\(\)]+$/)) {
      // Phone number masking
      return data.replace(/\d(?=\d{4})/g, '*');
    }
    if (data.length > 10) {
      // Generic long string masking
      return `${data.substring(0, 4)}***${data.substring(data.length - 4)}`;
    }
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item));
  }
  
  if (data && typeof data === 'object') {
    const masked: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (['password', 'token', 'key', 'secret'].some(sensitive => 
        key.toLowerCase().includes(sensitive))) {
        masked[key] = '***';
      } else if (['email', 'phone', 'address'].includes(key)) {
        masked[key] = maskSensitiveData(value);
      } else {
        masked[key] = maskSensitiveData(value);
      }
    }
    return masked;
  }
  
  return data;
}

export const encryptionUtils = {
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  generateApiKey,
  hashApiKey,
  verifyApiKey,
  encryptPII,
  decryptPII,
  generateHMAC,
  verifyHMAC,
  maskSensitiveData
};
