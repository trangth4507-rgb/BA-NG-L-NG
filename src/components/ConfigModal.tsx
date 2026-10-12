import React, { useState } from 'react';
import { TaxInsuranceConfig, PayrollPeriod } from '../types/payroll';
import { DEFAULT_CONFIG, REGIONAL_MINIMUM_SALARIES, STATUTORY_BASE_SALARY } from '../utils/payrollCalculator';
import { formatVND } from '../utils/vietnameseCurrency';
import { X, Settings, RotateCcw, ShieldCheck, Scale, Building, MapPin } from 'lucide-react';

interface ConfigModalProps {
  period: PayrollPeriod;
  onSave: (config: TaxInsuranceConfig, companyInfo: { companyName: string; companyAddress: string; taxCode: string; standardWorkDays: number }) => void;
  onClose: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ period, onSave, onClose }) => {
  const [config, setConfig] = useState<TaxInsuranceConfig>(() => ({
    ...period.config,
    region: period.config.region || 1,
    baseSalary: period.config.baseSalary || STATUTORY_BASE_SALARY,
    regionalMinimumSalary: period.config.regionalMinimumSalary || REGIONAL_MINIMUM_SALARIES[period.config.region || 1],
  }));

  const [companyName, setCompanyName] = useState(period.companyName);
  const [companyAddress, setCompanyAddress] = useState(period.companyAddress);
  const [taxCode, setTaxCode] = useState(period.taxCode);
  const [standardWorkDays, setStandardWorkDays] = useState(period.standardWorkDays);

  const handleRegionChange = (reg: 1 | 2 | 3 | 4) => {
    const minSal = REGIONAL_MINIMUM_SALARIES[reg];
    setConfig(prev => ({
      ...prev,
      region: reg,
      regionalMinimumSalary: minSal,
      maxBhtnBaseSalary: 20 * minSal,
    }));
  };

  const handleResetDefaults = () => {
    if (confirm('Khôi phục lại tất cả tham số theo quy định pháp luật lao động và thuế mới nhất?')) {
      setConfig({ ...DEFAULT_CONFIG });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config, {
      companyName,
      companyAddress,
      taxCode,
      standardWorkDays,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl my-6 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Cài Đặt Quy Định Mức Lương, BHXH &amp; Thuế Mới Nhất
              </h2>
              <p className="text-[11px] text-slate-500">
                Áp dụng chuẩn Nghị định 73/2024/NĐ-CP &amp; Nghị định 74/2024/NĐ-CP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Vùng Lương Tối Thiểu (NĐ 74/2024) & Lương Cơ Sở (NĐ 73/2024) */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2.5">
            <h4 className="font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              1. Căn Cứ Pháp Luật &amp; Vùng Lương Tối Thiểu Mới Nhất
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Địa bàn áp dụng Vùng tối thiểu (NĐ 74/2024/NĐ-CP):
                </label>
                <select
                  value={config.region}
                  onChange={e => handleRegionChange(parseInt(e.target.value, 10) as 1 | 2 | 3 | 4)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-blue-800"
                >
                  <option value={1}>Vùng I (Hà Nội, TP.HCM, Hải Phòng...) - 4.960.000 đ</option>
                  <option value={2}>Vùng II (Đà Nẵng, Cần Thơ, Nha Trang...) - 4.410.000 đ</option>
                  <option value={3}>Vùng III (Thành phố, thị xã trực thuộc tỉnh...) - 3.860.000 đ</option>
                  <option value={4}>Vùng IV (Các địa bàn còn lại) - 3.450.000 đ</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Trần đóng BHTN (20 lần tối thiểu vùng): {formatVND(config.maxBhtnBaseSalary)}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mức lương cơ sở (NĐ 73/2024/NĐ-CP):
                </label>
                <input
                  type="number"
                  step="10000"
                  value={config.baseSalary}
                  onChange={e => {
                    const base = parseFloat(e.target.value) || STATUTORY_BASE_SALARY;
                    setConfig({
                      ...config,
                      baseSalary: base,
                      maxInsuranceBaseSalary: 20 * base,
                    });
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Trần đóng BHXH, BHYT (20 lần lương cơ sở): {formatVND(config.maxInsuranceBaseSalary)}
                </span>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 text-[11px]">
              <Building className="w-3.5 h-3.5 text-slate-600" />
              2. Thông Tin Doanh Nghiệp &amp; Kỳ Lương
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-0.5">Tên công ty</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Mã số thuế</label>
                <input
                  type="text"
                  value={taxCode}
                  onChange={e => setTaxCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Insurance Rates */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <h4 className="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              3. Tỷ Lệ Trích Đóng Bảo Hiểm (BHXH, BHYT, BHTN)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* NLĐ */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-800 block text-indigo-900">
                  Người Lao Động Đóng (Trừ Lương):
                </span>
                <div className="flex justify-between items-center">
                  <span>BHXH (Hưu trí &amp; Tử tuất):</span>
                  <span className="font-bold text-indigo-700">8.0%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Bảo hiểm Y tế (BHYT):</span>
                  <span className="font-bold text-indigo-700">1.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Bảo hiểm Thất nghiệp (BHTN):</span>
                  <span className="font-bold text-indigo-700">1.0%</span>
                </div>
                <div className="pt-1 border-t text-right font-extrabold text-indigo-800">
                  Tổng NLĐ: 10.5% Mức Lương Đóng BHXH
                </div>
              </div>

              {/* Doanh nghiệp */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-800 block text-blue-900">
                  Doanh Nghiệp Đóng Cơ Quan BHXH (21.5%):
                </span>
                <div className="flex justify-between items-center">
                  <span>BHXH (Hưu trí 14% + Thai sản 3% + BNN 0.5%):</span>
                  <span className="font-bold text-blue-700">17.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Bảo hiểm Y tế (BHYT):</span>
                  <span className="font-bold text-blue-700">3.0%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Bảo hiểm Thất nghiệp (BHTN):</span>
                  <span className="font-bold text-blue-700">1.0%</span>
                </div>
                <div className="pt-1 border-t text-right font-extrabold text-blue-800 flex justify-between items-center">
                  <span className="text-[11px] text-slate-600">Tổng DN đóng BHXH:</span>
                  <span>21.5%</span>
                </div>
              </div>
            </div>

            {/* Banner tổng kết 32% chuẩn */}
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900">
              <span className="font-semibold">
                Tổng tỷ lệ trích đóng nộp Cơ quan BHXH (NLĐ 10.5% + DN 21.5%):
              </span>
              <span className="text-sm font-extrabold text-emerald-700">
                32.0% Mức Lương Đóng BHXH
              </span>
            </div>

            {/* Tùy chọn 2% Kinh phí Công đoàn */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-100 rounded-lg text-xs">
              <div>
                <span className="font-semibold text-slate-800">Kinh phí Công đoàn (2%)</span>
                <p className="text-[10px] text-slate-500">
                  Nộp Liên đoàn Lao động (không thuộc cơ quan BHXH). Bật nếu DN có đóng KPCĐ.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeTradeUnionFee || false}
                  onChange={e =>
                    setConfig({
                      ...config,
                      includeTradeUnionFee: e.target.checked,
                      employerUnionRate: e.target.checked ? 0.02 : 0,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Thuế TNCN */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <h4 className="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 text-[11px]">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              4. Mức Giảm Trừ Gia Cảnh &amp; Miễn Thuế TNCN
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Giảm trừ bản thân</label>
                <input
                  type="number"
                  step="500000"
                  value={config.personalDeduction}
                  onChange={e =>
                    setConfig({ ...config, personalDeduction: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">11.000.000 đ/tháng</span>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Giảm trừ 1 người phụ thuộc</label>
                <input
                  type="number"
                  step="200000"
                  value={config.dependentDeduction}
                  onChange={e =>
                    setConfig({ ...config, dependentDeduction: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">4.400.000 đ/người</span>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Miễn thuế ăn trưa tối đa</label>
                <input
                  type="number"
                  step="10000"
                  value={config.lunchTaxFreeLimit}
                  onChange={e =>
                    setConfig({ ...config, lunchTaxFreeLimit: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">730.000 đ/tháng</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại luật mới nhất
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs"
              >
                Lưu Áp Dụng
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
