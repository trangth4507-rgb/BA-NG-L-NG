import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { PayrollPeriod, CalculatedPayrollRow } from '../types/payroll';
import { exportDataAsJsonFile } from '../services/storage';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  Archive,
  CheckCircle,
  FileText,
} from 'lucide-react';

interface ExportImportModalProps {
  period: PayrollPeriod;
  allPeriods: PayrollPeriod[];
  calculatedRows: CalculatedPayrollRow[];
  onRestorePeriods: (periods: PayrollPeriod[]) => void;
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  period,
  allPeriods,
  calculatedRows,
  onRestorePeriods,
  onClose,
}) => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Export Excel (.xlsx)
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Bảng Tổng Hợp
    const summaryData = [
      [`BẢNG LƯƠNG NHÂN VIÊN THÁNG ${period.month}/${period.year}`],
      [`Đơn vị: ${period.companyName || 'Công Ty'} - MST: ${period.taxCode || 'N/A'}`],
      [],
      [
        'STT',
        'Mã NV',
        'Họ và tên',
        'Phòng ban',
        'Chức vụ',
        'Lương HĐLĐ',
        'Lương đóng BHXH',
        'Ngày công chuẩn',
        'Ngày công thực tế',
        'Lương ngày công',
        'Lương sản phẩm',
        'Lương làm thêm (OT)',
        'Phụ cấp hỗ trợ (không BHXH)',
        'Thưởng KPI',
        'TỔNG THU NHẬP (GROSS)',
        'Trích đóng BHXH/BHYT/BHTN (10.5%)',
        'Thuế TNCN',
        'Tạm ứng',
        'Khấu trừ khác',
        'THỰC LĨNH (NET)',
        'Số tài khoản',
        'Ngân hàng',
      ],
    ];

    calculatedRows.forEach((r, idx) => {
      summaryData.push([
        (idx + 1) as unknown as string,
        r.employee.code,
        r.employee.fullName,
        r.employee.department,
        r.employee.position,
        r.employee.contractSalary as unknown as string,
        (r.employee.hasInsurance ? r.insuranceBase : 0) as unknown as string,
        r.employee.standardWorkDays as unknown as string,
        r.employee.actualWorkDays as unknown as string,
        r.workdaySalary as unknown as string,
        r.pieceworkSalary as unknown as string,
        r.totalOvertimeSalary as unknown as string,
        r.totalAllowances as unknown as string,
        r.bonus as unknown as string,
        r.totalGrossIncome as unknown as string,
        r.totalEmployeeInsurance as unknown as string,
        r.pitTax as unknown as string,
        r.advancePayment as unknown as string,
        r.otherDeductions as unknown as string,
        r.netSalary as unknown as string,
        r.employee.bankAccount || '',
        r.employee.bankName || '',
      ]);
    });

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Bang_Luong_Tong_Hop');

    // Sheet 2: Chi tiết lương sản phẩm
    const pieceworkData = [
      [`CHI TIẾT LƯƠNG SẢN PHẨM THÁNG ${period.month}/${period.year}`],
      [],
      [
        'STT',
        'Mã NV',
        'Họ và tên',
        'Mã SP',
        'Tên sản phẩm / Công đoạn',
        'ĐVT',
        'Đơn giá (VNĐ)',
        'Số lượng hoàn thành',
        'Thành tiền (VNĐ)',
      ],
    ];

    let pIdx = 1;
    calculatedRows.forEach(r => {
      if (r.employee.pieceworkItems && r.employee.pieceworkItems.length > 0) {
        r.employee.pieceworkItems.forEach(item => {
          pieceworkData.push([
            (pIdx++) as unknown as string,
            r.employee.code,
            r.employee.fullName,
            item.productId,
            item.productName,
            item.unit,
            item.unitPrice as unknown as string,
            item.quantity as unknown as string,
            (item.quantity * item.unitPrice) as unknown as string,
          ]);
        });
      }
    });

    const wsPiecework = XLSX.utils.aoa_to_sheet(pieceworkData);
    XLSX.utils.book_append_sheet(wb, wsPiecework, 'Luong_San_Pham');

    // Write file
    const filename = `Bang_Luong_Thang_${period.month}_${period.year}.xlsx`;
    XLSX.writeFile(wb, filename);

    setSuccessMsg(`Đã xuất file Excel ${filename} thành công!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // 2. Backup full database to JSON
  const handleBackupJson = () => {
    const filename = `sao_luu_toan_bo_bang_luong_${Date.now()}.json`;
    exportDataAsJsonFile(allPeriods, filename);
    setSuccessMsg('Đã tạo và tải về bản sao lưu dữ liệu JSON an toàn!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // 3. Restore from JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (
            confirm(
              `Tìm thấy ${parsed.length} kỳ lương trong tệp sao lưu. Bạn có muốn khôi phục và ghi đè dữ liệu hiện tại?`
            )
          ) {
            onRestorePeriods(parsed);
            setSuccessMsg('Đã khôi phục dữ liệu thành công!');
            setTimeout(() => {
              setSuccessMsg(null);
              onClose();
            }, 1500);
          }
        } else {
          alert('Tệp JSON không đúng định dạng sao lưu bảng lương!');
        }
      } catch (err) {
        alert('Lỗi đọc tệp sao lưu: Tệp JSON không hợp lệ!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl my-6 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Xuất Báo Cáo &amp; Lưu Trữ Dữ Liệu Vĩnh Viễn
              </h2>
              <p className="text-xs text-slate-500">
                Tải bảng tính Excel (.xlsx), sao lưu offline và khôi phục hệ thống
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Option 1: Excel Export */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Xuất Bảng Lương Ra File Excel (.xlsx)
                </h4>
                <p className="text-slate-500 mt-0.5">
                  Tạo file Excel gồm 2 trang tính: Bảng tổng hợp chi tiết và Bảng kê lương sản phẩm từng nhân viên. Thích hợp lưu trữ nội bộ hoặc nộp phòng kế toán.
                </p>
              </div>
            </div>
            <button
              onClick={handleExportExcel}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <Download className="w-4 h-4" />
              Tải Xuống File Excel (.xlsx)
            </button>
          </div>

          {/* Option 2: Full Backup JSON */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div>
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Archive className="w-4 h-4 text-indigo-600" />
                Sao Lưu Dữ Liệu Vĩnh Viễn (Backup JSON)
              </h4>
              <p className="text-slate-500 mt-0.5">
                Tải về toàn bộ cơ sở dữ liệu ({allPeriods.length} kỳ lương, nhân sự, đơn giá sản phẩm và cấu hình) thành 1 tệp tin JSON an toàn. Giúp bạn lưu trữ vĩnh viễn trên máy tính hoặc chuyển đổi máy làm việc.
              </p>
            </div>
            <button
              onClick={handleBackupJson}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <Download className="w-4 h-4" />
              Tải Tệp Sao Lưu Dự Phòng (.json)
            </button>
          </div>

          {/* Option 3: Restore */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div>
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" />
                Khôi Phục Dữ Liệu Từ File Sao Lưu
              </h4>
              <p className="text-slate-500 mt-0.5">
                Chọn tệp JSON đã sao lưu trước đó để nạp lại toàn bộ dữ liệu bảng lương vào hệ thống.
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              Chọn Tệp JSON Để Khôi Phục
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
