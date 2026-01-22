import * as crypto from 'crypto';

// In production, this should be an Environment Variable (process.env.SECRET_KEY)
const SECRET_KEY = process.env.HMAC_SECRET || 'dev-secret-key-change-me-in-prod';

// Derive a 32-byte key for AES-256 from the secret
const KEY = crypto.scryptSync(SECRET_KEY, 'salt', 32);
const ALGORITHM = 'aes-256-cbc';

export interface TokenPayload {
  questionId: string;
  encAnswer: string; // Encrypted answer (replaces hash)
  tol?: number;      // Tolerance for numeric comparisons
  timestamp: number;
}

/**
 * Normalizes an answer string (trims, handles decimals).
 * " 5,5 " -> "5.5"
 */
export function normalizeAnswer(input: string | number): string {
  if (typeof input === 'number') return input.toString();
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(',', '.') // Standardize decimal separator
    .replace(/\s+/g, ''); // Remove all whitespace
}

/**
 * Encrypts a string so it can be safely sent to the client in a token
 * without revealing the value.
 */
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16); // Initialization vector
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts the value from the token.
 */
function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = parts.join(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Creates a signed token containing the ENCRYPTED answer and optional tolerance.
 */
export function generateToken(questionId: string, correctAnswer: string | number, tolerance: number = 0): string {
  const normalized = normalizeAnswer(correctAnswer);
  const encryptedAnswer = encrypt(normalized);

  const payload = JSON.stringify({
    questionId,
    encAnswer: encryptedAnswer,
    tol: tolerance,
    timestamp: Date.now()
  });

  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payload)
    .digest('hex');

  return Buffer.from(payload).toString('base64') + '.' + signature;
}

/**
 * Verifies a token and checks the answer.
 * Supports numeric tolerance if 'tol' was set in the token.
 */
export function verifyAnswer(userAnswer: string | number, token: string): boolean {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;

    // 1. Verify Signature
    const payloadStr = Buffer.from(payloadB64, 'base64').toString('utf-8');
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(payloadStr)
      .digest('hex');

    if (signature !== expectedSignature) return false;

    // 2. Parse Payload & Decrypt Correct Answer
    const data: TokenPayload = JSON.parse(payloadStr);
    const correctValStr = decrypt(data.encAnswer);
    const userValStr = normalizeAnswer(userAnswer);

    // 3. Check Tolerance (For Volume/Numeric questions)
    if (data.tol && data.tol > 0) {
        const cNum = parseFloat(correctValStr);
        const uNum = parseFloat(userValStr);
        
        // If both are valid numbers, check the range
        if (!isNaN(cNum) && !isNaN(uNum)) {
            return Math.abs(cNum - uNum) <= data.tol;
        }
    }

    // 4. Default Exact Match
    return correctValStr === userValStr;

  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
}