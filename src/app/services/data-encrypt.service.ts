// import { Injectable } from '@angular/core';
// import * as CryptoJS from 'crypto-js';
// import { enc } from 'crypto-js';

// @Injectable({
//   providedIn: 'root'
// })
// export class DataEncryptService {

//   constructor() { }

//   encryptUserData(user: any): string {
//     const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(user), 'encryption-secret-key').toString();
//     return encryptedData;
//   }

//   decryptUserData(encryptedData: string): any {
//     const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, 'encryption-secret-key');
//     const decryptedData = JSON.parse(decryptedBytes.toString(enc.Utf8));
//     return decryptedData;
//   }
// }
