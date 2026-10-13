import React, { useRef } from 'react';
import { CalculatedPayrollRow, PayrollPeriod } from '../types/payroll';
import { formatVND, formatNumber } from '../utils/vietnameseCurrency';
import {
  X,
  Printer,
  Copy,
  Check,
  Building,
  User,
  ShieldAlert,
  ArrowDownCircle,
  ArrowUpCircle,
  Download,
} from 'lucide-react';

interface PayslipModalProps {
  row: CalculatedPayrollRow;
  period: PayrollPeriod;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ row, period, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const emp = row.employee;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `PHIẾU LƯƠNG THÁNG ${period.month}/${period.year}
Nhân viên: ${emp.fullName} (${emp.code}) - ${emp.department}
---
1. Lương HĐLĐ: ${formatVND(emp.contractSalary)}
2. Lương ngày công (${emp.actualWorkDays}/${emp.standardWorkDays} ngày): ${formatVND(row.workdaySalary)}
3. Lương làm thêm giờ & trực ca đêm/cảng (OT): ${formatVND(row.totalOvertimeSalary)}
4. Phụ cấp đi tàu & hỗ trợ (không tính BHXH): ${formatVND(row.totalAllowances)}
5. Thưởng chuyến / KPI: ${formatVND(row.bonus)}
=> TỔNG THU NHẬP (GROSS): ${formatVND(row.totalGrossIncome)}

CÁC KHOẢN TRÍCH TRỪ:
- Lương đóng BHXH: ${formatVND(emp.hasInsurance ? row.insuranceBase : 0)}
- BHXH (8%): ${formatVND(row.employeeBhxh)}
- BHYT (1.5%): ${formatVND(row.employeeBhyt)}
- BHTN (1%): ${formatVND(row.employeeBhtn)}
- Thuế TNCN: ${formatVND(row.pitTax)}
- Tạm ứng: ${formatVND(row.advancePayment)}
---
=> THỰC LĨNH (NET): ${formatVND(row.netSalary)}
(Bằng chữ: ${row.netSalaryInWords})`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header (Non-printable) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <h2 className="text-base font-semibold text-slate-800">
              Phiếu Báo Lương Cá Nhân - {emp.fullName}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              title="Sao chép tóm tắt để gửi Zalo hoặc Email"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Đã sao chép!' : 'Gửi Zalo/Email'}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              In phiếu lương
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div ref={printRef} className="p-6 md:p-8 overflow-y-auto space-y-6 text-slate-800 text-sm print:p-0">
          {/* Company & Title Header */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-base font-bold uppercase tracking-tight text-slate-900">
                  {period.companyName || 'CÔNG TY'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">{period.companyAddress}</p>
                <p className="text-xs text-slate-500">MST: {period.taxCode || '---'}</p>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Mẫu số C02-HD</div>
                <div className="text-xs text-slate-500">Ban hành theo TT 200/BTC</div>
              </div>
            </div>

            <div className="text-center mt-4">
              <h2 className="text-xl font-extrabold uppercase tracking-wide text-blue-900">
                PHIẾU BÁO LƯƠNG VÀ CHI TRẢ THU NHẬP
              </h2>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                Kỳ lương: Tháng {period.month} năm {period.year}
              </p>
            </div>
          </div>

          {/* Employee Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 text-xs">
            <div>
              <span className="text-slate-500">Mã nhân viên:</span>{' '}
              <strong className="text-slate-900">{emp.code}</strong>
            </div>
            <div>
              <span className="text-slate-500">Họ và tên:</span>{' '}
              <strong className="text-slate-900">{emp.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-500">Phòng ban:</span>{' '}
              <span className="text-slate-800 font-medium">{emp.department}</span>
            </div>
            <div>
              <span className="text-slate-500">Chức vụ:</span>{' '}
              <span className="text-slate-800 font-medium">{emp.position}</span>
            </div>
            <div>
              <span className="text-slate-500">Mã số thuế:</span>{' '}
              <span className="text-slate-800 font-medium">{emp.taxId || 'Chưa cập nhật'}</span>
            </div>
            <div>
              <span className="text-slate-500">Người phụ thuộc:</span>{' '}
              <span className="text-slate-800 font-medium">{emp.dependentsCount} người</span>
            </div>
            <div>
              <span className="text-slate-500">Ngày công chuẩn:</span>{' '}
              <span className="text-slate-800 font-medium">{emp.standardWorkDays} ngày</span>
            </div>
            <div>
              <span className="text-slate-500">Ngày công thực tế:</span>{' '}
              <strong className="text-blue-700">{emp.actualWorkDays} ngày</strong>
            </div>
            <div>
              <span className="text-slate-500">Tài khoản nhận lương:</span>{' '}
              <span className="text-slate-800 font-medium">
                {emp.bankAccount ? `${emp.bankAccount} (${emp.bankName || 'Ngân hàng'})` : 'Tiền mặt'}
              </span>
            </div>
          </div>

          {/* Comparison Highlight: Lương đóng BHXH vs Tổng Thu Nhập */}
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-900">Mức lương làm căn cứ đóng BHXH:</span>
              <strong className="text-amber-800 text-sm">
                {emp.hasInsurance ? formatVND(row.insuranceBase) : 'Không tham gia BHXH'}
              </strong>
            </div>
            <span className="text-amber-700 text-[11px] italic">
              * Các khoản hỗ trợ, phụ cấp &amp; thưởng năng suất không tính vào lương đóng BHXH
            </span>
          </div>

          {/* 2 Columns: Thu Nhập (Earnings) vs Khấu Trừ (Deductions) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột 1: Các Khoản Thu Nhập */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 flex items-center justify-between">
                <span className="font-bold text-emerald-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowUpCircle className="w-4 h-4 text-emerald-600" />
                  I. CÁC KHOẢN THU NHẬP (GROSS)
                </span>
                <span className="font-bold text-emerald-700">{formatVND(row.totalGrossIncome)}</span>
              </div>

              <div className="p-3 space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">1. Lương HĐLĐ cơ bản:</span>
                  <span className="font-medium">{formatVND(emp.contractSalary)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">
                    2. Lương ngày công ({emp.actualWorkDays}/{emp.standardWorkDays}n):
                  </span>
                  <span className="font-semibold text-slate-900">{formatVND(row.workdaySalary)}</span>
                </div>

                {/* Làm thêm giờ / trực cảng */}
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">
                    3. Tiền làm thêm giờ (OT) &amp; trực ca đêm/cảng:
                  </span>
                  <span className="font-medium">{formatVND(row.totalOvertimeSalary)}</span>
                </div>

                {/* Phụ cấp hỗ trợ */}
                <div className="py-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-700">4. Các khoản phụ cấp đi tàu &amp; hỗ trợ:</span>
                    <span className="font-semibold">{formatVND(row.totalAllowances)}</span>
                  </div>
                  <div className="mt-1 pl-3 text-[11px] text-slate-500 space-y-0.5 border-l-2 border-slate-200">
                    {emp.allowances.lunch > 0 && (
                      <div className="flex justify-between">
                        <span>• Hỗ trợ ăn trưa:</span>
                        <span>{formatVND(emp.allowances.lunch)}</span>
                      </div>
                    )}
                    {emp.allowances.transport > 0 && (
                      <div className="flex justify-between">
                        <span>• Hỗ trợ xăng xe/đi lại:</span>
                        <span>{formatVND(emp.allowances.transport)}</span>
                      </div>
                    )}
                    {emp.allowances.phone > 0 && (
                      <div className="flex justify-between">
                        <span>• Hỗ trợ điện thoại:</span>
                        <span>{formatVND(emp.allowances.phone)}</span>
                      </div>
                    )}
                    {emp.allowances.housing > 0 && (
                      <div className="flex justify-between">
                        <span>• Hỗ trợ tiền nhà:</span>
                        <span>{formatVND(emp.allowances.housing)}</span>
                      </div>
                    )}
                    {emp.allowances.childcare > 0 && (
                      <div className="flex justify-between">
                        <span>• Hỗ trợ con nhỏ:</span>
                        <span>{formatVND(emp.allowances.childcare)}</span>
                      </div>
                    )}
                    {emp.allowances.attendance > 0 && (
                      <div className="flex justify-between">
                        <span>• Chuyên cần:</span>
                        <span>{formatVND(emp.allowances.attendance)}</span>
                      </div>
                    )}
                    {emp.allowances.otherTaxable > 0 && (
                      <div className="flex justify-between">
                        <span>• Phụ cấp khác:</span>
                        <span>{formatVND(emp.allowances.otherTaxable)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thưởng */}
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">5. Tiền thưởng chuyến / KPI / an toàn:</span>
                  <span className="font-medium text-emerald-600">{formatVND(row.bonus)}</span>
                </div>
              </div>
            </div>

            {/* Cột 2: Các Khoản Khấu Trừ */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-rose-50 px-4 py-2.5 border-b border-rose-100 flex items-center justify-between">
                <span className="font-bold text-rose-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowDownCircle className="w-4 h-4 text-rose-600" />
                  II. CÁC KHOẢN KHẤU TRỪ
                </span>
                <span className="font-bold text-rose-700">{formatVND(row.totalEmployeeDeductions)}</span>
              </div>

              <div className="p-3 space-y-2 text-xs divide-y divide-slate-100">
                <div className="py-1">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>1. Trích đóng Bảo hiểm (Tổng 10.5%):</span>
                    <span>{formatVND(row.totalEmployeeInsurance)}</span>
                  </div>
                  <div className="mt-1 pl-3 text-[11px] text-slate-500 space-y-0.5 border-l-2 border-rose-200">
                    <div className="flex justify-between">
                      <span>• BHXH (8%):</span>
                      <span>{formatVND(row.employeeBhxh)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• BHYT (1.5%):</span>
                      <span>{formatVND(row.employeeBhyt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• BHTN (1%):</span>
                      <span>{formatVND(row.employeeBhtn)}</span>
                    </div>
                  </div>
                </div>

                {/* Thuế TNCN */}
                <div className="py-1">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>2. Thuế Thu Nhập Cá Nhân (TNCN):</span>
                    <span className="text-rose-700">{formatVND(row.pitTax)}</span>
                  </div>
                  <div className="mt-1 pl-3 text-[11px] text-slate-500 space-y-0.5 border-l-2 border-amber-200">
                    <div className="flex justify-between">
                      <span>• Thu nhập tính thuế (TNTT):</span>
                      <span>{formatVND(row.assessableIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Giảm trừ bản thân:</span>
                      <span>{formatVND(row.personalDeduction)}</span>
                    </div>
                    {row.dependentDeduction > 0 && (
                      <div className="flex justify-between">
                        <span>• Giảm trừ người phụ thuộc:</span>
                        <span>{formatVND(row.dependentDeduction)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tạm ứng & Khấu trừ khác */}
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">3. Đã tạm ứng trong kỳ:</span>
                  <span className="font-medium text-slate-900">{formatVND(row.advancePayment)}</span>
                </div>

                {row.otherDeductions > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">4. Các khoản giảm trừ khác:</span>
                    <span className="font-medium">{formatVND(row.otherDeductions)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* NET SALARY HIGHLIGHT (THỰC LĨNH) */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-100">
                SỐ TIỀN THỰC LĨNH (NET SALARY)
              </span>
              <div className="text-2xl md:text-3xl font-extrabold text-white mt-0.5">
                {formatVND(row.netSalary)}
              </div>
            </div>
            <div className="md:text-right">
              <span className="text-xs text-emerald-100">Bằng chữ:</span>
              <div className="text-sm font-semibold text-amber-200 italic">
                {row.netSalaryInWords}
              </div>
            </div>
          </div>

          {/* Signatures Block */}
          <div className="grid grid-cols-3 gap-4 pt-6 text-center text-xs">
            <div className="space-y-12">
              <p className="font-bold uppercase text-slate-800">Người Lập Biểu</p>
              <p className="text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
            </div>
            <div className="space-y-12">
              <p className="font-bold uppercase text-slate-800">Kế Toán Trưởng</p>
              <p className="text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
            </div>
            <div className="space-y-12">
              <p className="font-bold uppercase text-slate-800">Người Nhận Tiền</p>
              <p className="text-slate-400 italic">(Ký xác nhận)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
