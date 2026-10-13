import React from 'react';
import { CalculatedPayrollRow, TaxInsuranceConfig } from '../types/payroll';
import { calculateSummary, REGIONAL_MINIMUM_SALARIES } from '../utils/payrollCalculator';
import { formatVND } from '../utils/vietnameseCurrency';
import {
  DollarSign,
  ShieldCheck,
  Receipt,
  TrendingUp,
  Scale,
  Building,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface SummaryCardsProps {
  calculatedRows: CalculatedPayrollRow[];
  config: TaxInsuranceConfig;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ calculatedRows, config }) => {
  const summary = calculateSummary(calculatedRows);

  const totalInsSalary = calculatedRows.reduce(
    (sum, r) => sum + (r.employee.hasInsurance ? r.insuranceBase : 0),
    0
  );

  const belowMinCount = calculatedRows.filter(r => r.isBelowRegionalMin).length;

  return (
    <div className="space-y-2.5">
      {/* Thanh 4 chỉ số KPI chính dạng compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* KPI 1: Tổng Gross */}
        <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Tổng Quỹ Lương Gross
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              {formatVND(summary.totalGross)}
            </div>
            <div className="text-[11px] text-slate-500">
              Phụ cấp: <strong className="text-blue-600">{formatVND(summary.totalAllowances)}</strong> • Tăng ca: <strong className="text-slate-700">{formatVND(summary.totalOvertime)}</strong>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 2: Thực Lĩnh Net */}
        <div className="bg-white rounded-xl p-3 border border-emerald-200 shadow-2xs bg-gradient-to-br from-white to-emerald-50/50 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
              Tổng Thực Lĩnh (Net)
            </div>
            <div className="text-lg sm:text-xl font-bold text-emerald-700 mt-0.5">
              {formatVND(summary.totalNet)}
            </div>
            <div className="text-[11px] text-emerald-600">
              Chi trả {summary.totalEmployees} NV {summary.totalAdvances > 0 && `(đã trừ ứng ${formatVND(summary.totalAdvances)})`}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 3: BHXH */}
        <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
              Quỹ BHXH ({((config.employeeBhxhRate + config.employeeBhytRate + config.employeeBhtnRate + config.employerBhxhRate + config.employerBhytRate + config.employerBhtnRate + (config.includeTradeUnionFee ? config.employerUnionRate : 0)) * 100).toFixed(1)}%)
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              {formatVND(summary.totalInsuranceFund)}
            </div>
            <div className="text-[11px] text-slate-600 flex gap-1.5 flex-wrap">
              <span>NLĐ (10.5%): <strong className="text-indigo-700">{formatVND(summary.totalEmployeeInsurance)}</strong></span>
              <span className="text-slate-400">|</span>
              <span>DN ({((config.employerBhxhRate + config.employerBhytRate + config.employerBhtnRate + (config.includeTradeUnionFee ? config.employerUnionRate : 0)) * 100).toFixed(1)}%): <strong>{formatVND(summary.totalEmployerInsurance)}</strong></span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        {/* KPI 4: Thuế TNCN */}
        <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              Thuế TNCN Khấu Trừ
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              {formatVND(summary.totalPitTax)}
            </div>
            <div className="text-[11px] text-slate-500">
              Tổng chi phí DN: <strong className="text-slate-800">{formatVND(summary.totalCompanyCost)}</strong>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Dải thông tin quy định mức lương mới nhất & Phân tách BHXH - Gọn gàng */}
      <div className="bg-slate-900 text-white rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 text-[10px] font-bold border border-blue-400/30">
            QUY ĐỊNH 2024-2026 MỚI NHẤT
          </span>
          <span className="text-slate-300">
            Lương cơ sở: <strong className="text-amber-300">{formatVND(config.baseSalary || 2340000)}</strong> (Trần BHXH: {formatVND(config.maxInsuranceBaseSalary || 46800000)})
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">
            Tối thiểu Vùng {config.region || 1}: <strong className="text-emerald-300">{formatVND(config.regionalMinimumSalary || REGIONAL_MINIMUM_SALARIES[config.region || 1])}</strong>
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">
            Giảm trừ gia cảnh: <strong>11tr/tháng</strong> (Phụ thuộc: <strong>4.4tr/người</strong>)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] text-slate-300">
            Tổng căn cứ đóng BHXH:{' '}
            <strong className="text-amber-300">{formatVND(totalInsSalary)}</strong> / Gross:{' '}
            <strong className="text-emerald-300">{formatVND(summary.totalGross)}</strong>
          </div>
          {belowMinCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 text-[10px] font-semibold border border-rose-400/30">
              <AlertTriangle className="w-3 h-3" />
              {belowMinCount} NV dưới sàn tối thiểu vùng
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
