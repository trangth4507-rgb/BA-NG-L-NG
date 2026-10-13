import { PayrollPeriod, ProductItem, Employee } from '../types/payroll';
import { DEFAULT_CONFIG } from '../utils/payrollCalculator';

const STORAGE_KEY = 'vietnam_payroll_system_data_v2';

export const INITIAL_PRODUCTS: ProductItem[] = [];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp_1',
    code: 'NV001',
    fullName: 'Nguyễn Văn Toàn',
    department: 'Đội Tàu Vận Tải Thủy',
    position: 'Thuyền trưởng Tàu Sông Biển SB',
    phone: '0981 234 567',
    email: 'toan.nguyen@vantai-cangbien.vn',
    taxId: '8023456789',
    dependentsCount: 1,
    hasInsurance: true,
    contractSalary: 18000000, // Lương theo HĐLĐ chức danh Thuyền trưởng
    insuranceSalary: 8000000, // Mức đóng BHXH theo thang bảng lương
    standardWorkDays: 26,
    actualWorkDays: 26,
    pieceworkItems: [],
    overtime: {
      weekdayHours: 12,
      weekendHours: 6,
      holidayHours: 0,
    },
    allowances: {
      lunch: 730000, // Tiền ăn ca / ăn trưa theo quy định
      transport: 500000, // Hỗ trợ đi lại / bến bãi
      phone: 500000, // Phụ cấp điện thoại liên lạc tàu - bờ
      housing: 1500000, // Phụ cấp lưu trú / theo tàu
      childcare: 500000, // Hỗ trợ con nhỏ
      attendance: 500000, // Chuyên cần chuyến
      otherTaxFree: 1000000, // Phụ cấp công tác phí đi tàu / đường thủy
      otherTaxable: 2000000, // Phụ cấp trách nhiệm thuyền trưởng
    },
    bonus: 2500000, // Thưởng an toàn luồng lạch & giải phóng tàu nhanh
    advancePayment: 2000000,
    otherDeductions: 0,
    bankAccount: '19034567890123',
    bankName: 'Techcombank',
    note: 'Thuyền trưởng đội sà lan tự hành - hoàn thành xuất sắc các chuyến vận tải luồng',
    gender: 'Nam',
    birthDate: '1985-06-20',
    idCard: '031085002341',
    idCardDate: '2021-04-10',
    socialInsuranceBookNumber: '7923456789',
    contractType: 'HĐ Không xác định thời hạn',
    startDate: '2020-03-15',
    status: 'active',
    address: 'Q. 7, TP. Hồ Chí Minh',
  },
  {
    id: 'emp_2',
    code: 'NV002',
    fullName: 'Trần Thị Thu Hà',
    department: 'Ban Khai Thác Cảng & Bến Bãi',
    position: 'Kế toán Cảng & Giao nhận Hàng Hải',
    phone: '0912 345 678',
    email: 'ha.tran@vantai-cangbien.vn',
    taxId: '8123456790',
    dependentsCount: 2,
    hasInsurance: true,
    contractSalary: 12000000,
    insuranceSalary: 7000000,
    standardWorkDays: 26,
    actualWorkDays: 25,
    pieceworkItems: [],
    overtime: {
      weekdayHours: 8,
      weekendHours: 4,
      holidayHours: 0,
    },
    allowances: {
      lunch: 730000,
      transport: 600000,
      phone: 400000,
      housing: 800000,
      childcare: 1000000, // Nuôi 2 con nhỏ
      attendance: 500000,
      otherTaxFree: 0,
      otherTaxable: 0,
    },
    bonus: 1000000,
    advancePayment: 0,
    otherDeductions: 0,
    bankAccount: '0011004567890',
    bankName: 'Vietcombank',
    gender: 'Nữ',
    birthDate: '1990-11-12',
    idCard: '031090008892',
    idCardDate: '2020-09-15',
    socialInsuranceBookNumber: '7923456790',
    contractType: 'HĐ Xác định thời hạn',
    startDate: '2021-08-01',
    status: 'active',
    address: 'TP. Thủ Đức, TP. Hồ Chí Minh',
  },
  {
    id: 'emp_3',
    code: 'NV003',
    fullName: 'Lê Hoàng Minh',
    department: 'Phòng Kỹ Thuật Đội Tàu',
    position: 'Máy trưởng Tàu Thủy',
    phone: '0978 901 234',
    email: 'minh.le@vantai-cangbien.vn',
    taxId: '8223456791',
    dependentsCount: 0,
    hasInsurance: true,
    contractSalary: 16500000,
    insuranceSalary: 8000000,
    standardWorkDays: 26,
    actualWorkDays: 26,
    pieceworkItems: [],
    overtime: {
      weekdayHours: 10,
      weekendHours: 8,
      holidayHours: 0,
    },
    allowances: {
      lunch: 730000,
      transport: 500000,
      phone: 500000,
      housing: 1000000,
      childcare: 0,
      attendance: 500000,
      otherTaxFree: 1000000, // Độc hại nặng nhọc buồng máy tàu thủy
      otherTaxable: 1500000, // Phụ cấp trách nhiệm Máy trưởng
    },
    bonus: 2000000,
    advancePayment: 0,
    otherDeductions: 0,
    bankAccount: '102867890123',
    bankName: 'VietinBank',
    gender: 'Nam',
    birthDate: '1987-04-05',
    idCard: '031087004512',
    idCardDate: '2019-12-05',
    socialInsuranceBookNumber: '7923456791',
    contractType: 'HĐ Không xác định thời hạn',
    startDate: '2019-05-10',
    status: 'active',
    address: 'H. Nhà Bè, TP. Hồ Chí Minh',
  },
  {
    id: 'emp_4',
    code: 'NV004',
    fullName: 'Phạm Phương Thảo',
    department: 'Ban Điều Độ & Luồng Lạch',
    position: 'Nhân viên Điều độ Bến Cảng & Luồng Lạch',
    phone: '0903 456 789',
    email: 'thao.pham@vantai-cangbien.vn',
    taxId: '8323456792',
    dependentsCount: 1,
    hasInsurance: true,
    contractSalary: 13000000,
    insuranceSalary: 7500000,
    standardWorkDays: 26,
    actualWorkDays: 26,
    pieceworkItems: [],
    overtime: {
      weekdayHours: 6,
      weekendHours: 0,
      holidayHours: 0,
    },
    allowances: {
      lunch: 730000,
      transport: 500000,
      phone: 500000,
      housing: 0,
      childcare: 500000,
      attendance: 500000,
      otherTaxFree: 500000,
      otherTaxable: 1000000, // Phụ cấp trực ca bến bãi
    },
    bonus: 1500000,
    advancePayment: 1000000,
    otherDeductions: 0,
    bankAccount: '0451000123456',
    bankName: 'MB Bank',
    gender: 'Nữ',
    birthDate: '1993-08-25',
    idCard: '031093006789',
    idCardDate: '2021-07-20',
    socialInsuranceBookNumber: '7923456792',
    contractType: 'HĐ Xác định thời hạn',
    startDate: '2022-02-15',
    status: 'active',
    address: 'Q. 4, TP. Hồ Chí Minh',
  },
  {
    id: 'emp_5',
    code: 'NV005',
    fullName: 'Vũ Đức Nam',
    department: 'Ban Giám Đốc / Điều Hành',
    position: 'Giám đốc Khai thác Vận tải Cảng',
    phone: '0918 888 999',
    email: 'nam.vu@vantai-cangbien.vn',
    taxId: '8423456793',
    dependentsCount: 2,
    hasInsurance: true,
    contractSalary: 32000000,
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
      housing: 2500000,
      childcare: 0,
      attendance: 0,
      otherTaxFree: 1000000,
      otherTaxable: 3000000, // Phụ cấp trách nhiệm điều hành cảng
    },
    bonus: 5000000,
    advancePayment: 0,
    otherDeductions: 0,
    bankAccount: '123456789999',
    bankName: 'BIDV',
    gender: 'Nam',
    birthDate: '1980-03-10',
    idCard: '031080001122',
    idCardDate: '2020-01-15',
    socialInsuranceBookNumber: '7923456793',
    contractType: 'HĐ Không xác định thời hạn',
    startDate: '2018-01-01',
    status: 'active',
    address: 'Q. 1, TP. Hồ Chí Minh',
  },
  {
    id: 'emp_6',
    code: 'NV006',
    fullName: 'Đặng Tuấn Anh',
    department: 'Đội Khai Thác Bến Cảng',
    position: 'Thủy thủ / Vận hành Cẩu Cảng',
    phone: '0966 112 233',
    email: 'tuananh@vantai-cangbien.vn',
    taxId: '8523456794',
    dependentsCount: 0,
    hasInsurance: true,
    contractSalary: 9500000,
    insuranceSalary: 5500000,
    standardWorkDays: 26,
    actualWorkDays: 26,
    pieceworkItems: [],
    overtime: {
      weekdayHours: 14,
      weekendHours: 6,
      holidayHours: 0,
    },
    allowances: {
      lunch: 730000,
      transport: 400000,
      phone: 200000,
      housing: 800000,
      childcare: 0,
      attendance: 400000,
      otherTaxFree: 800000, // Độc hại nặng nhọc bốc xếp bến cảng
      otherTaxable: 0,
    },
    bonus: 1000000,
    advancePayment: 500000,
    otherDeductions: 0,
    bankAccount: '190367891122',
    bankName: 'Techcombank',
    gender: 'Nam',
    birthDate: '1995-09-18',
    idCard: '031095007823',
    idCardDate: '2022-05-12',
    socialInsuranceBookNumber: '7923456794',
    contractType: 'HĐ Xác định thời hạn',
    startDate: '2023-04-01',
    status: 'active',
    address: 'H. Cần Giờ, TP. Hồ Chí Minh',
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
    companyName: 'CÔNG TY CP VẬN TẢI THỦY NỘI ĐỊA & CẢNG BIỂN TIẾN PHÁT',
    companyAddress: 'Khu Bến Cảng Sông Biển / ICD Vận Tải Nội Địa, TP. Hồ Chí Minh',
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
      // Chuẩn hóa và làm sạch: Loại bỏ lương sản phẩm, cập nhật doanh nghiệp vận tải thủy nội địa & cảng biển
      const normalized = data.map((p: PayrollPeriod) => {
        const isOldManufacture =
          !p.companyName ||
          p.companyName.includes('TIẾN THỊNH') ||
          p.companyName.includes('SẢN XUẤT');

        const companyName = isOldManufacture
          ? 'CÔNG TY CP VẬN TẢI THỦY NỘI ĐỊA & CẢNG BIỂN TIẾN PHÁT'
          : p.companyName;

        const companyAddress = isOldManufacture
          ? 'Khu Bến Cảng Sông Biển / ICD Vận Tải Nội Địa, TP. Hồ Chí Minh'
          : p.companyAddress;

        // Xóa sạch mọi mục lương sản phẩm của nhân viên vì đây là công ty vận chuyển thủy cảng biển
        const cleanedEmployees = (p.employees || []).map(emp => {
          const isOldWorker =
            emp.position?.includes('Thợ may') ||
            emp.department?.includes('Xưởng Sản Xuất') ||
            emp.position?.includes('bo mạch');

          if (isOldWorker) {
            const matchInitial = INITIAL_EMPLOYEES.find(ie => ie.code === emp.code);
            if (matchInitial) {
              return {
                ...matchInitial,
                actualWorkDays: emp.actualWorkDays || matchInitial.actualWorkDays,
                pieceworkItems: [],
              };
            }
          }

          return {
            ...emp,
            pieceworkItems: [],
          };
        });

        return {
          ...p,
          companyName,
          companyAddress,
          products: [],
          employees: cleanedEmployees.length > 0 ? cleanedEmployees : INITIAL_EMPLOYEES,
          config: {
            ...p.config,
            employerUnionRate: 0,
            includeTradeUnionFee: false,
          },
        };
      });

      saveAllPeriods(normalized);
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
