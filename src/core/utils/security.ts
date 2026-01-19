import * as crypto from 'crypto';

// In production, this should be an Environment Variable (process.env.SECRET_KEY)
// For now, we use a fallback for local dev if env is missing.
const SECRET_KEY = process.env.HMAC_SECRET || 'dev-secret-key-change-me-in-prod';

export interface TokenPayload {
  questionId: string;
  answerHash: string; // The hashed answer
  timestamp: number;
}

/**
 * Normalizes an answer string (trims, lowercase, handles decimals)
 * to ensure " 5.5 " equals "5,5".
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
 * Creates a signed token containing the answer.
 * We do NOT send the raw answer in the token to the client,
 * only a hash of the answer, to prevent decoding attacks.
 */
export function generateToken(questionId: string, correctAnswer: string | number): string {
  const normalized = normalizeAnswer(correctAnswer);
  
  // Hash the answer first so even decoding the JWT doesn't reveal the answer
  const answerHash = crypto.createHash('sha256').update(normalized).digest('hex');

  const payload = JSON.stringify({
    questionId,
    answerHash,
    timestamp: Date.now()
  });

  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payload)
    .digest('hex');

  // Return Payload.Signature
  return Buffer.from(payload).toString('base64') + '.' + signature;
}

/**
 * Verifies a token and checks if the user's answer matches the hashed answer inside.
 */
export function verifyAnswer(userAnswer: string | number, token: string): boolean {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;

    // 1. Re-create signature to verify integrity
    const payloadStr = Buffer.from(payloadB64, 'base64').toString('utf-8');
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(payloadStr)
      .digest('hex');

    if (signature !== expectedSignature) return false;

    // 2. Parse Payload
    const data = JSON.parse(payloadStr);

    // 3. Verify Answer
    const normalizedUserAnswer = normalizeAnswer(userAnswer);
    const userAnswerHash = crypto.createHash('sha256').update(normalizedUserAnswer).digest('hex');

    return data.answerHash === userAnswerHash;
  } catch (err) {
    console.error("Token verification failed:", err);
    return false;
  }
}