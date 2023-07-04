declare module 'crypto-js' {
  export const AES: {
    encrypt(message: string, secretKey: string): { toString(): string };
    decrypt(ciphertext: string, secretKey: string): { toString(enc: any): string };
  };

  // Add other methods as needed
}
