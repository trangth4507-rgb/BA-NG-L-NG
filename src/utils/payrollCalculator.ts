import {
  Employee,
  TaxInsuranceConfig,
  CalculatedPayrollRow,
  PitBracketCalc,
} from '../types/payroll';
import { numberToVietnameseWords } from './vietnameseCurrency';

/**
 * Mức lương tối thiểu vùng mới nhất theo Nghị định 74/2024/NĐ-CP (áp dụng từ 01/07/2024):
 * - Vùng I: 4.960.000 đ/tháng
 * - Vùng II: 4.410.000 đ/tháng
 * - Vùng III: 3.860.000 đ/tháng
 * - Vùng IV: 3.450.000 đ/tháng
 */
export const REGIONAL_MINIMUM_SALARIES: Record<1 | 2 | 3 | 4, number> = {
  1: 4960000,
  2: 4410000,
  3: 3860000,
  4: 3450000,
};

/**
 * Lương cơ sở mới nhất theo Nghị định 73/2024/NĐ-CP (áp dụng từ 01/07/2024):
 * 2.340.000 đ/tháng.
 * => Trần tiền lương đóng BHXH, BHYT tối đa (20 lần lương cơ sở): 20 x 2.340.000 = 46.800.000 đ
 */
export const STATUTORY_BASE_SALARY = 2340000;

export const DEFAULT_CONFIG: TaxInsuranceConfig = {
  region: 1,
  baseSalary: STATUTORY_BASE_SALARY,
  regionalMinimumSalary: REGIONAL_MINIMUM_SALARIES[1],
  employeeBhxhRate: 0.08, // 8%
  employeeBhytRate: 0.015, // 1.5%
  employeeBhtnRate: 0.01, // 1%
  employerBhxhRate: 0.175, // 17.5% (14% Hưu trí tử tuất + 3% Ốm đau thai sản + 0.5% BNN)
  employerBhytRate: 0.03, // 3%
  employerBhtnRate: 0.01, // 1%
  employerUnionRate: 0, // 0% (Tổng trích nộp cơ quan BHXH là 32.0%: DN 21.5% + NLĐ 10.5%)
  includeTradeUnionFee: false, // Tùy chọn 2% KPCĐ nộp Công đoàn
  personalDeduction: 11000000, // 11 triệu/tháng
  dependentDeduction: 4400000, // 4.4 triệu/người/tháng
  lunchTaxFreeLimit: 730000, // 730k/tháng (Thông tư 26/2015/TT-BTC)
  maxInsuranceBaseSalary: 46800000, // 20 lần mức 2.340.000đ
  maxBhtnBaseSalary: 99200000, // 20 lần mức tối thiểu vùng 1 (4.96tr x 20)
};

// 7 bậc thuế lũy tiến từng phần theo Luật Thuế TNCN Việt Nam (Điều 22 Luật Thuế TNCN)
const PIT_BRACKETS = [
  { bracket: 1, limit: 5000000, rate: 0.05 },
  { bracket: 2, limit: 10000000, rate: 0.10 },
  { bracket: 3, limit: 18000000, rate: 0.15 },
  { bracket: 4, limit: 32000000, rate: 0.20 },
  { bracket: 5, limit: 52000000, rate: 0.25 },
  { bracket: 6, limit: 80000000, rate: 0.30 },
  { bracket: 7, limit: Infinity, rate: 0.35 },
];

export function calculatePitTax(assessableIncome: number): {
  totalTax: number;
  brackets: PitBracketCalc[];
} {
  if (assessableIncome <= 0) {
    return {
      totalTax: 0,
      brackets: PIT_BRACKETS.map(b => ({
        bracket: b.bracket,
        rate: b.rate,
        taxablePortion: 0,
        taxAmount: 0,
      })),
    };
  }

  let remaining = assessableIncome;
  let prevLimit = 0;
  let totalTax = 0;
  const brackets: PitBracketCalc[] = [];

  for (const b of PIT_BRACKETS) {
    const rangeSpan = b.limit - prevLimit;
    if (remaining > 0) {
      const taxablePortion = Math.min(remaining, rangeSpan);
      const taxAmount = Math.round(taxablePortion * b.rate);
      totalTax += taxAmount;
      remaining -= taxablePortion;
      brackets.push({
        bracket: b.bracket,
        rate: b.rate,
        taxablePortion,
        taxAmount,
      });
    } else {
      brackets.push({
        bracket: b.bracket,
        rate: b.rate,
        taxablePortion: 0,
        taxAmount: 0,
      });
    }
    prevLimit = b.limit;
  }

  return { totalTax: Math.round(totalTax), brackets };
}

export function calculateEmployeeSalary(
  employee: Employee,
  config: TaxInsuranceConfig = DEFAULT_CONFIG
): CalculatedPayrollRow {
  const stdDays = employee.standardWorkDays > 0 ? employee.standardWorkDays : 26;
  const actualDays = Math.max(0, employee.actualWorkDays || 0);

  // 1. Lương theo ngày công thực tế
  const workdaySalary = Math.round((employee.contractSalary / stdDays) * actualDays);

  // 2. Lương sản phẩm / năng suất
  const pieceworkSalary = (employee.pieceworkItems || []).reduce(
    (sum, item) => sum + (item.quantity * item.unitPrice || 0),
    0
  );

  // 3. Tiền làm thêm giờ (OT) theo Điều 98 Bộ luật Lao động 2019
  const hourlyRate = employee.contractSalary / (stdDays * 8);
  const ot = employee.overtime || { weekdayHours: 0, weekendHours: 0, holidayHours: 0 };
  const otWeekdaySalary = Math.round((ot.weekdayHours || 0) * hourlyRate * 1.5);
  const otWeekendSalary = Math.round((ot.weekendHours || 0) * hourlyRate * 2.0);
  const otHolidaySalary = Math.round((ot.holidayHours || 0) * hourlyRate * 3.0);
  const totalOvertimeSalary = otWeekdaySalary + otWeekendSalary + otHolidaySalary;

  // Điểm i Khoản 1 Điều 3 Thông tư 111/2013/TT-BTC: Phần thu nhập trả thêm do làm thêm giờ được miễn thuế TNCN
  const overtimeTaxExemptSalary = Math.round(
    (ot.weekdayHours || 0) * hourlyRate * 0.5 +
    (ot.weekendHours || 0) * hourlyRate * 1.0 +
    (ot.holidayHours || 0) * hourlyRate * 2.0
  );

  // 4. Các khoản hỗ trợ, phụ cấp hàng tháng
  // QUY ĐỊNH PHÁP LUẬT: KHÔNG TÍNH ĐÓNG BHXH (Thông tư 06/2021/TT-BLĐTBXH)
  const al = employee.allowances || {
    lunch: 0,
    transport: 0,
    phone: 0,
    housing: 0,
    childcare: 0,
    attendance: 0,
    otherTaxFree: 0,
    otherTaxable: 0,
  };

  const totalAllowances =
    (al.lunch || 0) +
    (al.transport || 0) +
    (al.phone || 0) +
    (al.housing || 0) +
    (al.childcare || 0) +
    (al.attendance || 0) +
    (al.otherTaxFree || 0) +
    (al.otherTaxable || 0);

  // Phân tích miễn thuế của phụ cấp
  const lunchTaxExempt = Math.min(al.lunch || 0, config.lunchTaxFreeLimit);
  const transportTaxExempt = al.transport || 0;
  const phoneTaxExempt = al.phone || 0;
  const childcareTaxExempt = al.childcare || 0;
  const otherTaxFreeExempt = al.otherTaxFree || 0;

  const taxFreeAllowances =
    lunchTaxExempt +
    transportTaxExempt +
    phoneTaxExempt +
    childcareTaxExempt +
    otherTaxFreeExempt;

  const taxableAllowances = Math.max(0, totalAllowances - taxFreeAllowances);

  // 5. Tổng thu nhập (Gross Income)
  const bonus = employee.bonus || 0;
  const totalGrossIncome =
    workdaySalary +
    pieceworkSalary +
    totalOvertimeSalary +
    totalAllowances +
    bonus;

  // 6. Trích nộp BHXH / BHYT / BHTN theo mức lương đóng BHXH hợp đồng
  let insuranceBase = 0;
  let bhtnBase = 0;
  let employeeBhxh = 0;
  let employeeBhyt = 0;
  let employeeBhtn = 0;
  let employerBhxh = 0;
  let employerBhyt = 0;
  let employerBhtn = 0;
  let employerUnion = 0;
  let isBelowRegionalMin = false;

  if (employee.hasInsurance) {
    const rawInsBase = employee.insuranceSalary > 0 ? employee.insuranceSalary : employee.contractSalary;
    insuranceBase = Math.min(rawInsBase, config.maxInsuranceBaseSalary);
    bhtnBase = Math.min(rawInsBase, config.maxBhtnBaseSalary);

    // Cảnh báo nếu mức đóng BHXH thấp hơn mức tối thiểu vùng theo luật
    const regionalMin = config.regionalMinimumSalary || REGIONAL_MINIMUM_SALARIES[config.region || 1];
    if (insuranceBase < regionalMin) {
      isBelowRegionalMin = true;
    }

    employeeBhxh = Math.round(insuranceBase * config.employeeBhxhRate);
    employeeBhyt = Math.round(insuranceBase * config.employeeBhytRate);
    employeeBhtn = Math.round(bhtnBase * config.employeeBhtnRate);

    employerBhxh = Math.round(insuranceBase * config.employerBhxhRate);
    employerBhyt = Math.round(insuranceBase * config.employerBhytRate);
    employerBhtn = Math.round(bhtnBase * config.employerBhtnRate);
    employerUnion = Math.round(insuranceBase * config.employerUnionRate);
  }

  const totalEmployeeInsurance = employeeBhxh + employeeBhyt + employeeBhtn;
  const totalEmployerInsurance = employerBhxh + employerBhyt + employerBhtn + employerUnion;
  const totalCompanyCost = totalGrossIncome + totalEmployerInsurance;

  // 7. Thuế TNCN
  const taxExemptIncome = taxFreeAllowances + overtimeTaxExemptSalary;
  const taxableIncome = Math.max(0, totalGrossIncome - taxExemptIncome);

  const personalDeduction = config.personalDeduction;
  const dependentDeduction = (employee.dependentsCount || 0) * config.dependentDeduction;
  const insuranceDeduction = totalEmployeeInsurance;
  const totalDeductionsForTax = personalDeduction + dependentDeduction + insuranceDeduction;

  const assessableIncome = Math.max(0, taxableIncome - totalDeductionsForTax);
  const pitResult = calculatePitTax(assessableIncome);
  const pitTax = pitResult.totalTax;

  // 8. Các khoản khấu trừ & Lương thực nhận (Net Salary)
  const advancePayment = employee.advancePayment || 0;
  const otherDeductions = employee.otherDeductions || 0;
  const totalEmployeeDeductions = totalEmployeeInsurance + pitTax + advancePayment + otherDeductions;

  const netSalary = Math.max(0, totalGrossIncome - totalEmployeeDeductions);
  const netSalaryInWords = numberToVietnameseWords(netSalary);

  return {
    employee,
    workdaySalary,
    pieceworkSalary,
    overtimeWeekdaySalary: otWeekdaySalary,
    overtimeWeekendSalary: otWeekendSalary,
    overtimeHolidaySalary: otHolidaySalary,
    totalOvertimeSalary,
    overtimeTaxExemptSalary,
    totalAllowances,
    taxFreeAllowances,
    taxableAllowances,
    bonus,
    totalGrossIncome,

    insuranceBase,
    bhtnBase,
    employeeBhxh,
    employeeBhyt,
    employeeBhtn,
    totalEmployeeInsurance,

    employerBhxh,
    employerBhyt,
    employerBhtn,
    employerUnion,
    totalEmployerInsurance,
    totalCompanyCost,

    taxExemptIncome,
    taxableIncome,
    personalDeduction,
    dependentDeduction,
    insuranceDeduction,
    totalDeductionsForTax,
    assessableIncome,
    pitBrackets: pitResult.brackets,
    pitTax,

    advancePayment,
    otherDeductions,
    totalEmployeeDeductions,
    netSalary,
    netSalaryInWords,
    isBelowRegionalMin,
  };
}

export function calculateSummary(rows: CalculatedPayrollRow[]) {
  return rows.reduce(
    (acc, row) => {
      acc.totalGross += row.totalGrossIncome;
      acc.totalNet += row.netSalary;
      acc.totalPiecework += row.pieceworkSalary;
      acc.totalAllowances += row.totalAllowances;
      acc.totalOvertime += row.totalOvertimeSalary;
      acc.totalEmployeeInsurance += row.totalEmployeeInsurance;
      acc.totalEmployerInsurance += row.totalEmployerInsurance;
      acc.totalInsuranceFund += row.totalEmployeeInsurance + row.totalEmployerInsurance;
      acc.totalPitTax += row.pitTax;
      acc.totalAdvances += row.advancePayment;
      acc.totalCompanyCost += row.totalCompanyCost;
      acc.totalEmployees += 1;
      if (row.employee.hasInsurance) acc.insuredEmployees += 1;
      return acc;
    },
    {
      totalGross: 0,
      totalNet: 0,
      totalPiecework: 0,
      totalAllowances: 0,
      totalOvertime: 0,
      totalEmployeeInsurance: 0,
      totalEmployerInsurance: 0,
      totalInsuranceFund: 0,
      totalPitTax: 0,
      totalAdvances: 0,
      totalCompanyCost: 0,
      totalEmployees: 0,
      insuredEmployees: 0,
    }
  );
}
