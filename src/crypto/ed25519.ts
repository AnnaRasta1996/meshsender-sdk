import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

const { decodeBase64, encodeBase64, decodeUTF8 } = naclUtil as unknown as {
  decodeBase64: (s: string) => Uint8Array;
  encodeBase64: (a: Uint8Array) => string;
  decodeUTF8: (s: string) => Uint8Array;
};

export type DemoKeyPair = Readonly<{
  publicKey: Uint8Array;
  secretKey: Uint8Array;
  publicKeyB64: string;
}>;

export function generateDemoKeyPair(seed?: Uint8Array): DemoKeyPair {
  const kp = seed ? nacl.sign.keyPair.fromSeed(seed) : nacl.sign.keyPair();
  return {
    publicKey: kp.publicKey,
    secretKey: kp.secretKey,
    publicKeyB64: encodeBase64(kp.publicKey),
  };
}

export function signUtf8Detached(message: string, secretKey: Uint8Array): string {
  return encodeBase64(nacl.sign.detached(decodeUTF8(message), secretKey));
}

export function verifyUtf8Detached(
  message: string,
  signatureB64: string,
  publicKey: Uint8Array
): boolean {
  try {
    return nacl.sign.detached.verify(
      decodeUTF8(message),
      decodeBase64(signatureB64),
      publicKey
    );
  } catch {
    return false;
  }
}

export function decodePublicKeyB64(publicKeyB64: string): Uint8Array {
  const bytes = decodeBase64(publicKeyB64.trim());
  if (bytes.length !== 32) {
    throw new Error('PUBLIC_KEY_LENGTH_INVALID');
  }
  return bytes;
}

export { encodeBase64, decodeBase64 };
