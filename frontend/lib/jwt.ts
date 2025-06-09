// lib/jwt.ts
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// Convert string secret to Uint8Array for jose
const encoder = new TextEncoder();
const secretKey = encoder.encode(JWT_SECRET);

import type { JWTPayload } from 'jose';

export const createToken = async (payload: JWTPayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secretKey);
};

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (err) {
    console.error('JWT verification error:', err);
    return null;
  }
};
