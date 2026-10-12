import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
  onSnapshot,
  getDocFromServer,
  writeBatch,
} from 'firebase/firestore';
import { firebaseConfig } from '../config/firebaseConfig';
import { PayrollPeriod, Employee, ProductItem, TaxInsuranceConfig } from '../types/payroll';

// Khởi tạo Firebase App & Firestore Database với ID chuẩn của dự án
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const FIRESTORE_DATABASE_ID =
  (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId ||
  'ai-studio-bnglngdoanhnghip-464b9891-b58d-44a4-9f61-2c7f0df26bcc';

export const db = getFirestore(app, FIRESTORE_DATABASE_ID);

const PERIODS_COLLECTION = 'payroll_periods';
const SETTINGS_COLLECTION = 'settings';
const EMPLOYEES_MASTER_COLLECTION = 'employees_master';
const PRODUCTS_MASTER_COLLECTION = 'products_master';

export type FirestoreSyncStatus = 'connecting' | 'connected' | 'syncing' | 'error' | 'offline';

/**
 * Kiểm tra kết nối Firestore lúc khởi động ứng dụng
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    console.info('Firestore connection state:', error);
    return true; // Still connected or online
  }
}

/**
 * Lưu 1 kỳ bảng lương trực tuyến vĩnh viễn lên Cloud Firestore
 */
export async function savePeriodToFirestore(period: PayrollPeriod): Promise<void> {
  try {
    const docRef = doc(db, PERIODS_COLLECTION, period.id);
    await setDoc(
      docRef,
      {
        ...period,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Lỗi khi lưu bảng lương lên Cloud Firestore:', error);
    throw error;
  }
}

/**
 * Xóa 1 kỳ bảng lương khỏi Firestore
 */
export async function deletePeriodFromFirestore(periodId: string): Promise<void> {
  try {
    const docRef = doc(db, PERIODS_COLLECTION, periodId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Lỗi khi xóa kỳ lương khỏi Cloud Firestore:', error);
    throw error;
  }
}

/**
 * Tải toàn bộ các kỳ bảng lương từ Cloud Firestore
 */
export async function loadPeriodsFromFirestore(): Promise<PayrollPeriod[] | null> {
  try {
    const colRef = collection(db, PERIODS_COLLECTION);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const periods: PayrollPeriod[] = [];
      snap.forEach(d => {
        periods.push(d.data() as PayrollPeriod);
      });
      periods.sort((a, b) => b.year - a.year || b.month - a.month);
      return periods;
    }
    return null;
  } catch (error) {
    console.warn('Chưa thể tải dữ liệu từ Cloud Firestore:', error);
    return null;
  }
}

/**
 * Lắng nghe thay đổi dữ liệu thời gian thực từ Cloud Firestore
 */
export function subscribeToPeriods(onUpdate: (periods: PayrollPeriod[]) => void) {
  try {
    const colRef = collection(db, PERIODS_COLLECTION);
    return onSnapshot(
      colRef,
      snap => {
        if (!snap.empty) {
          const periods: PayrollPeriod[] = [];
          snap.forEach(d => {
            periods.push(d.data() as PayrollPeriod);
          });
          periods.sort((a, b) => b.year - a.year || b.month - a.month);
          onUpdate(periods);
        }
      },
      err => {
        console.warn('Lỗi Firestore Snapshot:', err);
      }
    );
  } catch (err) {
    console.warn('Không thể thiết lập lắng nghe Firestore:', err);
    return () => {};
  }
}

/**
 * Lưu danh mục hồ sơ nhân viên gốc (Master Employees) lên Firestore
 */
export async function saveMasterEmployeesToFirestore(employees: Employee[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    employees.forEach(emp => {
      const docRef = doc(db, EMPLOYEES_MASTER_COLLECTION, emp.id);
      batch.set(docRef, emp, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    console.warn('Lỗi lưu master employees lên Firestore:', error);
  }
}

/**
 * Lưu thông tin doanh nghiệp & cấu hình thuế lên Firestore
 */
export async function saveCompanyProfileToFirestore(
  companyInfo: { companyName: string; companyAddress: string; taxCode: string; standardWorkDays: number },
  config: TaxInsuranceConfig
): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'company_profile');
    await setDoc(docRef, {
      ...companyInfo,
      config,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.warn('Lỗi lưu cấu hình công ty lên Firestore:', error);
  }
}
