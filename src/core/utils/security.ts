import * as crypto from 'crypto';

// Use a fixed secret for development, but in prod use process.env.HMAC_SECRET
const SECRET_KEY = process.env.HMAC_SECRET || 'dev-secret-key-change-me-in-prod';

// Derive a consistent 32-byte key from the secret
const KEY = crypto.scryptSync(SECRET_KEY, 'salt', 32);
const IV_LENGTH = 16; 

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
  if (typeof text !== 'string') {
      text = String(text);
  }
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts a string.
 */
function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Generates a signed JWT-like token containing the encrypted answer.
 * Handles Numbers, Strings, and Objects safely.
 */
export function generateToken(qId: string, answer: string | number | object, tol: number = 0): string {
  // CRITICAL FIX: Ensure answer is a string before encrypting to prevent AES crash
  let encVal = "";
  if (typeof answer === 'object') {
      encVal = JSON.stringify(answer);
  } else {
      encVal = String(answer);
  }

  const payload: TokenPayload = {
    qId,
    enc: encrypt(encVal),
    tol,
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

    // 3. Check for Numeric Tolerance
    if (payload.tol && payload.tol > 0) {
        const cNum = parseFloat(correctVal);
        const uNum = parseFloat(userVal);
        
        if (!isNaN(cNum) && !isNaN(uNum)) {
            return Math.abs(cNum - uNum) <= payload.tol;
        }
    }

    // 4. Standard String Comparison
    // Special handling for coordinate strings or objects if they were stringified
    if (correctVal.startsWith('{') || correctVal.startsWith('[')) {
        // If the answer is complex (like json), verification might need specific logic
        // For now, we normalize the decrypted string and compare
        return normalizeAnswer(correctVal) === userVal;
    }

    return normalizeAnswer(correctVal) === userVal;
  } catch (err) {
    console.error("Token verification failed:", err);
    return false;
  }
}