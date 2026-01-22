import * as crypto from 'crypto';

// Use a fixed secret for development, but in prod use process.env.HMAC_SECRET
const SECRET_KEY = process.env.HMAC_SECRET || 'dev-secret-key-change-me-in-prod';

// Derive a consistent 32-byte key from the secret
const KEY = crypto.scryptSync(SECRET_KEY, 'salt', 32);
const ALGORITHM = 'aes-256-cbc';

export interface TokenPayload {
  qId: string;      // Question ID
  enc: string;      // Encrypted Answer
  tol?: number;     // Tolerance (optional)
  ts: number;       // Timestamp
}

/**
 * Normalizes an answer for comparison.
 * " y = 2x + 4 " -> "y=2x+4"
 * "5,5" -> "5.5"
 */
export function normalizeAnswer(input: string | number): string {
  if (input === undefined || input === null) return "";
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(',', '.') // Replace comma with dot for decimals
    .replace(/\s+/g, ''); // Remove all spaces
}

/**
 * Encrypts a string.
 */
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts a string.
 */
function decrypt(text: string): string {
  try {
    const parts = text.split(':');
    if (parts.length !== 2) return "";
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encryptedText = parts.join(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    return "";
  }
}

/**
 * Generates a signed token with the encrypted answer.
 */
export function generateToken(questionId: string, correctAnswer: string | number, tolerance: number = 0): string {
  const normAnswer = normalizeAnswer(correctAnswer);
  const encrypted = encrypt(normAnswer);

  const payload: TokenPayload = {
    qId: questionId,
    enc: encrypted,
    tol: tolerance,
    ts: Date.now()
  };

  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr).toString('base64');

  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payloadB64)
    .digest('hex');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies the user's answer against the token.
 */
export function verifyAnswer(userAnswer: string | number, token: string): boolean {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;

    // 1. Verify Signature
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(payloadB64)
      .digest('hex');

    if (signature !== expectedSignature) return false;

    // 2. Decrypt Correct Answer
    const payload: TokenPayload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf-8'));
    const correctVal = decrypt(payload.enc);
    const userVal = normalizeAnswer(userAnswer);

    // 3. Numeric Tolerance Check
    if (payload.tol && payload.tol > 0) {
        const cNum = parseFloat(correctVal);
        const uNum = parseFloat(userVal);
        if (!isNaN(cNum) && !isNaN(uNum)) {
            return Math.abs(cNum - uNum) <= payload.tol;
        }
    }

    // 4. Standard Exact Match
    return correctVal === userVal;

  } catch (error) {
    console.error("Verification Error:", error);
    return false;
  }
}