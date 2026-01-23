import * as crypto from 'crypto';

// Use a fixed secret for development, but in prod use process.env.HMAC_SECRET
const SECRET_KEY = process.env.HMAC_SECRET || 'dev-secret-key-change-me-in-prod';

// Derive a consistent 32-byte key from the secret
const KEY = crypto.scryptSync(SECRET_KEY, 'salt', 32);
const ALGORITHM = 'aes-256-cbc';

export interface TokenPayload {
  qId: string;      
  enc: string;      
  tol?: number;     
  ts: number;       
}

export function normalizeAnswer(input: string | number): string {
  if (input === undefined || input === null) return "";
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(',', '.') 
    .replace(/\s+/g, ''); 
}

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function generateToken(qId: string, answer: string | number | object, tol: number = 0): string {
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

export function verifyAnswer(userAnswer: string | number, token: string): boolean {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;

    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(payloadB64)
      .digest('hex');

    if (signature !== expectedSignature) return false;

    const payload: TokenPayload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf-8'));
    const correctVal = decrypt(payload.enc);
    const userVal = normalizeAnswer(userAnswer);

    if (payload.tol && payload.tol > 0) {
        const cNum = parseFloat(correctVal);
        const uNum = parseFloat(userVal);
        if (!isNaN(cNum) && !isNaN(uNum)) {
            return Math.abs(cNum - uNum) <= payload.tol;
        }
    }
    
    // Check for "x=" prefix flexibility for Equation levels
    if (userVal.startsWith('x=') && !correctVal.startsWith('x=')) {
         return userVal.split('=')[1] === normalizeAnswer(correctVal);
    }
    
    // Handle scale/coordinate objects
    if (correctVal.startsWith('{')) {
        return normalizeAnswer(correctVal) === userVal;
    }

    return normalizeAnswer(correctVal) === userVal;
  } catch (err) {
    console.error("Token verification failed:", err);
    return false;
  }
}

// NEW EXPORT to retrieve answer for history logs
export function getCorrectAnswer(token: string): string {
    try {
        const [payloadB64, signature] = token.split('.');
        const payload: TokenPayload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf-8'));
        return decrypt(payload.enc);
    } catch (e) {
        return "";
    }
}