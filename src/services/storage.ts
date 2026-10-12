import { PayrollPeriod, ProductItem, Employee } from '../types/payroll';
import { DEFAULT_CONFIG } from '../utils/payrollCalculator';

const STORAGE_KEY = 'vietnam_payroll_system_data_v2';

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod_1',
    code: 'SP-MAY-01',
    name: 'Gia công may Áo Polo xuất khẩu',
    unit: 'Chiếc',
    unitPrice: 45000,
    note: 'Định mức may ráp hoàn thiện',
  },
  {
    id: 'prod_2',
    code: 'SP-LAP-02',
    name: 'Lắp ráp Bo mạch Điện tử Modul B',
    unit: 'Bộ',
    unitPrice: 65000,
    note: 'Yêu cầu kiểm định phòng sạch',
  },
  {
    id: 'prod_3',
    code: 'SP-DONG-03',
    name: 'Đóng gói sản phẩm & Dán tem thùng',
    unit: 'Thùng',
    unitPrice: 20000,
    note: 'Đóng thùng carton 24 sp',
  },
  {
    id: 'prod_4',
    code: 'SP-QC-04',
    name: 'Kiểm tra chất lượng thành phẩm QC',
    unit: 'Lô',
    unitPrice: 50000,
    note: 'Test chức năng và đóng dấu đạt',
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp_1',
    code: 'NV001',
    fullName: 'Nguyễn Văn Toàn',
    department: 'Xưởng Sản Xuất 1',
    position: 'Thợ may chính',
    phone: '0981 234 567',
    email: 'toan.nguyen@congty.com',
    taxId: '8023456789',
    dependentsCount: 1,
    hasInsurance: true,
    contractSalary: 5500000, // Lương cơ bản HĐLĐ
    insuranceSalary: 5500000, // Mức đóng BHXH
    standardWorkDays: 26,
    actualWorkDays: 26,
    pieceworkItems: [
      {
        productId: 'prod_1',
        productName: 'Gia công may Áo Polo xuất khẩu',
        unit: 'Chiếc',
        unitPrice: 45000,
        quantity: 180,
        total: 8100000,
      },
      {
        productId: 'prod_3',
        productName: 'Đóng gói sản phẩm & Dán tem thùng',
        unit: 'Thùng',
        unitPrice: 20000,
        quantity: 50,
        total: 1000000,
      },
    ],
    overtime: {
      weekdayHours: 12,
      weekendHours: 6,
      holidayHours: 0,
    },
    allowances: {
      lunch: 730000, // Miễn thuế, không tính đóng BHXH
      transport: 500000, // Không tính đóng BHXH
      phone: 200000, // Không tính đóng BHXH
      housing: 1000000, // Không tính đóng BHXH
      childcare: 500000, // Không tính đóng BHXH
      attendance: 500000, // Không tính đóng BHXH
      otherTaxFree: 0,
      otherTaxable: 0,
    },
    bonus: 1000000,
    advancePayment: 2000000,
    otherDeductions: 0,
    bankAccount: '19034567890123',
    bankName: 'Techcombank',
    note: 'Đạt năng suất vượt bậc trong tháng',
  },
  {
    id: 'emp_2',
    code: 'NV002',
    fullName: 'Trần Thị Thu Hà',
    department: 'Xưởng Sản Xuất 2',
    position: 'Kỹ thuật viên bo mạch',
    phone: '0912 345 678',
    email: 'ha.tran@congty.com',
    taxId: '8123456790',
    dependentsCount: 2,
    hasInsurance: true,
    contractSalary: 6000000,
    insuranceSalary: 6000000,
    standardWorkDays: 26,
    actualWorkDays: 25,
    pieceworkItems: [
      {
        productId: 'prod_2',
        productName: 'Lắp ráp Bo mạch Điện tử Modul B',
        unit: 'Bộ',
        unitPrice: 65000,
        quantity: 150,
        total: 9750000,
      },
    ],
    overtime: {
      weekdayHours: 8,
      weekendHours: 4,
      holidayHours: 0,
    },
    allowances: {
      lunch: 730000,
      transport: 600000,
      phone: 300000,
      housing: 800000,
      childcare: 1000000, // Nuôi 2 con nhỏ
      attendance: 500000,
      otherTaxFree: 0,
      otherTaxable: 0,
    },
    bonus: 500000,
    advancePayment: 0,
    otherDeductions: 0,
    bankAccount: '0011004567890',
    bankName: 'Vietcombank',
  },
  {
    id: 'emp_3',
    code: 'NV003',
    fullName: 'Lê Hoàng Minh',
    department: 'Bộ Phận Kỹ Thuật & QC',
    position: 'Trưởng nhóm Kiểm định',
    phone: '0978 901 234',
    email: 'minh.le@congty.com',
    taxId: '8223456791',
    dependentsCount: 0,
    hasInsurance: true,
    contractSalary: 12000000,
    insuranceSalary: 8000000, // Đăng ký đóng BHXH 8 triệu theo thang bảng lương
    standardWorkDays: 26,
    actualWorkDays: 26,
    pieceworkItems: [
      {
        productId: 'prod_4',
        productName: 'Kiểm tra chất lượng thành phẩm QC',
        unit: 'Lô',
        unitPrice: 50000,
        quantity: 70,
        total: 3500000,
      },
    ],
    overtime: {
      weekdayHours: 10,
      weekendHours: 8,
      holidayHours: 0,
    },
    allowances: {
      lunch: 730000,
      transport: 500000,
      phone: 500000,
      housing: 0,
      childcare: 0,
      attendance: 500000,
      otherTaxFree: 0,
      otherTaxable: 1000000, // Phụ cấp trách nhiệm trưởng nhóm
    },
    bonus: 2000000,
    advancePayment: 0,
    otherDeductions: 0,
    bankAccount: '102867890123',
    bankName: 'VietinBank',
  },
  {
    id: 'emp_4',
    code: 'NV004',
    fullName: 'Phạm Phương Thảo',
    department: 'Phòng Kế Toán - Hành Chính',
    position: 'Kế toán tổng hợp',
    phone: '0903 456 789',
    email: 'thao.pham@congty.com',
    taxId: '8323456792',
    dependentsCount: 1,
    hasInsurance: true,
    contractSalary: 14000000,
    insuranceSalary: 9000000,
    standardWorkDays: 26,
    actualWorkDays: 26,
    pieceworkItems: [],
    overtime: {
      weekdayHours: 5,
      weekendHours: 0,
      holidayHours: 0,
    },
    allowances: {
      lunch: 730000,
      transport: 400000,
      phone: 400000,
      housing: 0,
      childcare: 500000,
      attendance: 500000,
      otherTaxFree: 500000, // Trang phục công sở
      otherTaxable: 0,
    },
    bonus: 1500000,
    advancePayment: 1000000,
    otherDeductions: 0,
    bankAccount: '0451000123456',
    bankName: 'MB Bank',
  },
  {
    id: 'emp_5',
    code: 'NV005',
    fullName: 'Vũ Đức Nam',
    department: 'Ban Giám Đốc / Điều Hành',
    position: 'Giám đốc Điều hành SX',
    phone: '0918 888 999',
    email: 'nam.vu@congty.com',
    taxId: '8423456793',
    dependentsCount: 2,
    hasInsurance: true,
    contractSalary: 35000000,
    insuranceSalary: 15000000,
    standardWorkDays: 26,
    actualWorkDays: 26,
    pieceworkItems: [],
    overtime: {
      weekdayHours: 0,
      weekendHours: 0,
      holidayHours: 0,
    },
    allowances: {
      lunch: 730000,
      transport: 2000000,
      phone: 1000000,
      housing: 3000000,
      childcare: 0,
      attendance: 0,
      otherTaxFree: 1000000,
      otherTaxable: 2000000,
    },
    bonus: 5000000,
    advancePayment: 0,
    otherDeductions: 0,
    bankAccount: '123456789999',
    bankName: 'BIDV',
  },
  {
    id: 'emp_6',
    code: 'NV006',
    fullName: 'Đặng Tuấn Anh',
    department: 'Xưởng Sản Xuất 1',
    position: 'Nhân viên thử việc',
    phone: '0966 112 233',
    email: 'tuananh@congty.com',
    taxId: '',
    dependentsCount: 0,
    hasInsurance: false, // Thử việc chưa đóng BHXH
    contractSalary: 4500000,
    insuranceSalary: 0,
    standardWorkDays: 26,
    actualWorkDays: 24,
    pieceworkItems: [
      {
        productId: 'prod_1',
        productName: 'Gia công may Áo Polo xuất khẩu',
        unit: 'Chiếc',
        unitPrice: 45000,
        quantity: 90,
        total: 4050000,
      },
    ],
    overtime: {
      weekdayHours: 4,
      weekendHours: 0,
      holidayHours: 0,
    },
    allowances: {
      lunch: 730000,
      transport: 300000,
      phone: 0,
      housing: 500000,
      childcare: 0,
      attendance: 300000,
      otherTaxFree: 0,
      otherTaxable: 0,
    },
    bonus: 300000,
    advancePayment: 500000,
    otherDeductions: 0,
    bankAccount: '190367891122',
    bankName: 'Techcombank',
  },
];

export function getInitialPayrollPeriod(): PayrollPeriod {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return {
    id: `period_${currentYear}_${currentMonth}`,
    month: currentMonth,
    year: currentYear,
    title: `Bảng Lương Tháng ${currentMonth}/${currentYear}`,
    companyName: 'CÔNG TY TNHH SẢN XUẤT & THƯƠNG MẠI TIẾN THỊNH',
    companyAddress: 'Khu Công Nghiệp Tân Bình, TP. Hồ Chí Minh',
    taxCode: '0315894268',
    standardWorkDays: 26,
    employees: INITIAL_EMPLOYEES,
    products: INITIAL_PRODUCTS,
    config: DEFAULT_CONFIG,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function loadAllPeriods(): PayrollPeriod[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = [getInitialPayrollPeriod()];
      saveAllPeriods(initial);
      return initial;
    }
    const data = JSON.parse(raw);
    if (Array.isArray(data) && data.length > 0) {
      // Chuẩn hóa tỷ lệ bảo hiểm về 32% (DN 21.5% + NLĐ 10.5%) nếu chưa cấu hình riêng
      const normalized = data.map((p: PayrollPeriod) => {
        if (p.config && p.config.employerUnionRate === 0.02 && !p.config.includeTradeUnionFee) {
          return {
            ...p,
            config: {
              ...p.config,
              employerUnionRate: 0,
              includeTradeUnionFee: false,
            },
          };
        }
        return p;
      });
      return normalized;
    }
    const initial = [getInitialPayrollPeriod()];
    saveAllPeriods(initial);
    return initial;
  } catch (err) {
    console.error('Error loading periods from localStorage:', err);
    return [getInitialPayrollPeriod()];
  }
}

export function saveAllPeriods(periods: PayrollPeriod[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(periods));
  } catch (err) {
    console.error('Error saving periods to localStorage:', err);
  }
}

export function exportDataAsJsonFile(data: unknown, filename = 'backup_bang_luong.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
