export interface ProductItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  unitPrice: number;
  note?: string;
}

export interface EmployeePieceworkRecord {
  productId: string;
  productName: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Allowances {
  lunch: number; // Hỗ trợ ăn trưa (không đóng BHXH, miễn thuế TNCN ≤ 730k)
  transport: number; // Hỗ trợ xăng xe/đi lại (không đóng BHXH)
  phone: number; // Hỗ trợ điện thoại (không đóng BHXH)
  housing: number; // Hỗ trợ nhà ở/lưu trú (không đóng BHXH)
  childcare: number; // Hỗ trợ con nhỏ/nuôi con (không đóng BHXH, miễn thuế phúc lợi)
  attendance: number; // Chuyên cần (không đóng BHXH)
  otherTaxFree: number; // Khoản hỗ trợ khác miễn thuế (trang phục, công tác phí...)
  otherTaxable: number; // Phụ cấp trách nhiệm/chức vụ chịu thuế (không đóng BHXH)
}

export interface OvertimeInfo {
  weekdayHours: number; // Ngày thường (hệ số 150%)
  weekendHours: number; // Nghỉ hàng tuần (hệ số 200%)
  holidayHours: number; // Ngày lễ, Tết (hệ số 300%)
}

export interface Employee {
  id: string;
  code: string;
  fullName: string;
  department: string;
  position: string;
  phone: string;
  email: string;
  taxId: string; // Mã số thuế cá nhân
  dependentsCount: number; // Số người phụ thuộc giảm trừ gia cảnh
  hasInsurance: boolean; // Có tham gia BHXH bắt buộc hay không
  contractSalary: number; // Lương thỏa thuận / Lương cơ bản theo hợp đồng
  insuranceSalary: number; // Mức lương đóng BHXH (thường khác hoặc thấp hơn tổng thu nhập)
  standardWorkDays: number; // Ngày công chuẩn tháng (thường 22 hoặc 26 ngày)
  actualWorkDays: number; // Ngày công đi làm thực tế
  pieceworkItems: EmployeePieceworkRecord[]; // Chi tiết lương sản phẩm
  overtime: OvertimeInfo;
  allowances: Allowances;
  bonus: number; // Tiền thưởng hiệu quả / KPI / lễ
  advancePayment: number; // Tạm ứng trong tháng
  otherDeductions: number; // Các khoản trừ khác (phạt, đoàn phí riêng...)
  bankAccount?: string;
  bankName?: string;
  note?: string;
}

export interface TaxInsuranceConfig {
  region: 1 | 2 | 3 | 4; // Vùng I, II, III, IV theo Nghị định 74/2024/NĐ-CP
  baseSalary: number; // Mức lương cơ sở: 2.340.000 đ (NĐ 73/2024/NĐ-CP)
  regionalMinimumSalary: number; // Mức lương tối thiểu vùng (Vùng I: 4.96tr, Vùng II: 4.41tr...)
  // Người lao động đóng (trừ vào lương)
  employeeBhxhRate: number; // 8% (Hưu trí & Tử tuất)
  employeeBhytRate: number; // 1.5% (Bảo hiểm y tế)
  employeeBhtnRate: number; // 1% (Bảo hiểm thất nghiệp)
  // Người sử dụng lao động (Doanh nghiệp) đóng
  employerBhxhRate: number; // 17.5% (14% Hưu trí tử tuất + 3% Ốm đau thai sản + 0.5% BNN)
  employerBhytRate: number; // 3%
  employerBhtnRate: number; // 1%
  employerUnionRate: number; // Kinh phí công đoàn (mặc định 0% để tổng đóng BHXH chuẩn 32%)
  includeTradeUnionFee?: boolean; // Tùy chọn tính thêm 2% Kinh phí công đoàn
  // Mức giảm trừ gia cảnh (VNĐ/tháng)
  personalDeduction: number; // 11.000.000 đ
  dependentDeduction: number; // 4.400.000 đ/người
  // Mức miễn thuế TNCN ăn trưa
  lunchTaxFreeLimit: number; // 730.000 đ/tháng
  // Trần tiền lương đóng BHXH, BHYT (20 lần mức lương cơ sở hiện hành = 46.800.000 đ)
  maxInsuranceBaseSalary: number;
  // Trần đóng BHTN (20 lần mức lương tối thiểu vùng)
  maxBhtnBaseSalary: number;
}

export interface PitBracketCalc {
  bracket: number;
  rate: number;
  taxablePortion: number;
  taxAmount: number;
}

export interface CalculatedPayrollRow {
  employee: Employee;
  // Thành phần thu nhập
  workdaySalary: number; // Lương theo ngày công thực tế
  pieceworkSalary: number; // Tổng lương sản phẩm
  overtimeWeekdaySalary: number;
  overtimeWeekendSalary: number;
  overtimeHolidaySalary: number;
  totalOvertimeSalary: number;
  overtimeTaxExemptSalary: number; // Phần lương làm thêm giờ được miễn thuế TNCN
  totalAllowances: number; // Tổng phụ cấp hỗ trợ
  taxFreeAllowances: number; // Phần phụ cấp được miễn thuế
  taxableAllowances: number; // Phần phụ cấp chịu thuế
  bonus: number;
  totalGrossIncome: number; // Tổng thu nhập trước thuế & bảo hiểm

  // Bảo hiểm
  insuranceBase: number; // Mức lương căn cứ tính BHXH
  bhtnBase: number; // Căn cứ BHTN
  employeeBhxh: number; // 8%
  employeeBhyt: number; // 1.5%
  employeeBhtn: number; // 1%
  totalEmployeeInsurance: number; // 10.5%

  employerBhxh: number; // 17.5%
  employerBhyt: number; // 3%
  employerBhtn: number; // 1%
  employerUnion: number; // 2%
  totalEmployerInsurance: number; // 23.5%
  totalCompanyCost: number; // Tổng chi phí công ty = Gross + Bảo hiểm DN

  // Thuế TNCN
  taxExemptIncome: number; // Thu nhập được miễn thuế (ăn trưa định mức, làm thêm tăng ca miễn thuế,...)
  taxableIncome: number; // Thu nhập chịu thuế
  personalDeduction: number; // 11 triệu
  dependentDeduction: number; // 4.4 triệu x người
  insuranceDeduction: number; // Giảm trừ bảo hiểm bắt buộc
  totalDeductionsForTax: number; // Tổng các khoản giảm trừ
  assessableIncome: number; // Thu nhập tính thuế (TNTT)
  pitBrackets: PitBracketCalc[]; // Chi tiết 7 bậc thuế
  pitTax: number; // Thuế TNCN phải nộp

  // Khấu trừ khác & Thực lĩnh
  advancePayment: number;
  otherDeductions: number;
  totalEmployeeDeductions: number; // BHXH + Thuế TNCN + Tạm ứng + Khác
  netSalary: number; // Thực lĩnh
  netSalaryInWords: string; // Số tiền bằng chữ tiếng Việt
  isBelowRegionalMin?: boolean; // Cảnh báo lương đóng BHXH thấp hơn lương tối thiểu vùng
}

export interface PayrollPeriod {
  id: string;
  month: number;
  year: number;
  title: string;
  companyName: string;
  companyAddress: string;
  taxCode: string;
  standardWorkDays: number;
  employees: Employee[];
  products: ProductItem[];
  config: TaxInsuranceConfig;
  status: 'draft' | 'finalized' | 'paid';
  googleSpreadsheetId?: string;
  googleSpreadsheetUrl?: string;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}
