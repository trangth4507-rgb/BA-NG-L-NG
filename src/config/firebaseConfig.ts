import rawConfig from '../../firebase-applet-config.json';

export interface FirebaseAppConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
  oAuthClientId?: string;
  recaptchaSiteKey?: string;
}

export const firebaseConfig: FirebaseAppConfig = {
  projectId: rawConfig.projectId || 'quanlyhosomotcua',
  appId: rawConfig.appId || '',
  apiKey: rawConfig.apiKey || '',
  authDomain: rawConfig.authDomain || 'quanlyhosomotcua.firebaseapp.com',
  firestoreDatabaseId:
    rawConfig.firestoreDatabaseId ||
    'ai-studio-bnglngdoanhnghip-464b9891-b58d-44a4-9f61-2c7f0df26bcc',
  storageBucket: rawConfig.storageBucket || 'quanlyhosomotcua.firebasestorage.app',
  messagingSenderId: rawConfig.messagingSenderId || '844370411777',
  measurementId: rawConfig.measurementId || '',
  oAuthClientId: rawConfig.oAuthClientId || '',
  recaptchaSiteKey: rawConfig.recaptchaSiteKey || '',
};

export default firebaseConfig;
