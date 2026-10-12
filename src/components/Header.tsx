import React from 'react';
import { User } from 'firebase/auth';
import { PayrollPeriod } from '../types/payroll';
import {
  FileSpreadsheet,
  Settings,
  Package,
  Download,
  Calendar,
  PlusCircle,
  ExternalLink,
  Cloud,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

interface HeaderProps {
  currentPeriod: PayrollPeriod;
  allPeriods: PayrollPeriod[];
  currentUser: User | null;
  isCloudSynced: boolean;
  onSelectPeriod: (periodId: string) => void;
  onCreateNewPeriod: () => void;
  onChangeRegion: (region: 1 | 2 | 3 | 4) => void;
  onOpenGoogleSheetsModal: () => void;
  onOpenPieceworkModal: () => void;
  onOpenConfigModal: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPeriod,
  allPeriods,
  currentUser,
  isCloudSynced,
  onSelectPeriod,
  onCreateNewPeriod,
  onChangeRegion,
  onOpenGoogleSheetsModal,
  onOpenPieceworkModal,
  onOpenConfigModal,
  onOpenExportModal,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 shadow-2xs sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-2 gap-2">
          {/* Brand & Online Status */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Bảng Lương Doanh Nghiệp
                </h1>
                {/* Cloud Sync Status Indicator */}
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                  title="Dữ liệu được lưu trữ trực tuyến vĩnh viễn trên Cloud Firestore, an toàn tuyệt đối và không bị mất"
                >
                  <Cloud className="w-3 h-3 text-emerald-600" />
                  <span>{isCloudSynced ? 'Đã lưu đám mây' : 'Lưu trực tuyến'}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                {currentPeriod.companyName || 'Công ty'} • BHXH 10.5% - Thuế TNCN 7 bậc
              </p>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {/* Vùng Lương Tối Thiểu (NĐ 74/2024/NĐ-CP) */}
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-medium hidden sm:inline">Vùng:</span>
              <select
                value={currentPeriod.config.region || 1}
                onChange={e => onChangeRegion(parseInt(e.target.value, 10) as 1 | 2 | 3 | 4)}
                className="bg-transparent text-[11px] font-bold text-slate-800 pr-1 py-0.5 focus:outline-hidden cursor-pointer"
                title="Chọn vùng lương tối thiểu theo Nghị định 74/2024/NĐ-CP"
              >
                <option value={1}>Vùng I (4.96tr)</option>
                <option value={2}>Vùng II (4.41tr)</option>
                <option value={3}>Vùng III (3.86tr)</option>
                <option value={4}>Vùng IV (3.45tr)</option>
              </select>
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={currentPeriod.id}
                onChange={e => onSelectPeriod(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-slate-800 pr-1 py-0.5 focus:outline-hidden cursor-pointer"
              >
                {allPeriods.map(p => (
                  <option key={p.id} value={p.id}>
                    Tháng {p.month}/{p.year}
                  </option>
                ))}
              </select>
              <button
                onClick={onCreateNewPeriod}
                className="p-0.5 text-blue-600 hover:text-blue-800 rounded transition-colors"
                title="Tạo kỳ lương mới"
              >
                <PlusCircle className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Google Sheets Trigger */}
            <button
              onClick={onOpenGoogleSheetsModal}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                currentPeriod.googleSpreadsheetId
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Đồng bộ xuất sang Google Sheets (tùy chọn chia sẻ)"
            >
              <FileSpreadsheet
                className={`w-3.5 h-3.5 ${
                  currentPeriod.googleSpreadsheetId ? 'text-emerald-600' : 'text-slate-500'
                }`}
              />
              <span className="hidden sm:inline">Google Sheets</span>
            </button>

            {currentPeriod.googleSpreadsheetUrl && (
              <a
                href={currentPeriod.googleSpreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 text-emerald-700 hover:text-emerald-900 bg-emerald-100/60 rounded-md transition-colors"
                title="Mở Google Sheets"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Lương Sản Phẩm */}
            <button
              onClick={onOpenPieceworkModal}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              <Package className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">Lương Sản Phẩm</span>
            </button>

            {/* Cài Đặt */}
            <button
              onClick={onOpenConfigModal}
              className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors"
              title="Cài đặt tỷ lệ BHXH & mức giảm trừ"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {/* Xuất & Lưu Trữ */}
            <button
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-300" />
              <span>Xuất File</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
