import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { PayrollPeriod } from '../types/payroll';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const firestoreDatabaseId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;

export const db = typeof firestoreDatabaseId === 'string' && firestoreDatabaseId.length > 0
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);

const COLLECTION_NAME = 'payroll_periods';

/**
 * Kiểm tra kết nối Firestore lúc khởi động
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    // If permission or offline, still return false safely
    return false;
  }
}

/**
 * Lưu 1 kỳ bảng lương lên Cloud Firestore trực tuyến vĩnh viễn
 */
export async function savePeriodToCloud(period: PayrollPeriod): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, period.id);
    await setDoc(docRef, {
      ...period,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.warn('Lỗi khi lưu lên Cloud Firestore, dữ liệu vẫn được lưu tại Local Storage:', error);
  }
}

/**
 * Tải toàn bộ các kỳ bảng lương từ Cloud Firestore
 */
export async function loadPeriodsFromCloud(): Promise<PayrollPeriod[] | null> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const periods: PayrollPeriod[] = [];
      snap.forEach(d => {
        periods.push(d.data() as PayrollPeriod);
      });
      // Sort by year, month descending
      periods.sort((a, b) => b.year - a.year || b.month - a.month);
      return periods;
    }
    return null;
  } catch (error) {
    console.warn('Không thể tải từ Cloud Firestore:', error);
    return null;
  }
}

/**
 * Đăng ký lắng nghe thay đổi thời gian thực từ Cloud Firestore
 */
export function subscribeToPeriods(onUpdate: (periods: PayrollPeriod[]) => void) {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    return onSnapshot(colRef, snap => {
      if (!snap.empty) {
        const periods: PayrollPeriod[] = [];
        snap.forEach(d => {
          periods.push(d.data() as PayrollPeriod);
        });
        periods.sort((a, b) => b.year - a.year || b.month - a.month);
        onUpdate(periods);
      }
    }, err => {
      console.warn('Firestore subscription error:', err);
    });
  } catch (err) {
    console.warn('Could not setup firestore listener:', err);
    return () => {};
  }
}
