import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { PayrollPeriod } from '../types/payroll';
import { FirestoreSyncStatus, FIRESTORE_DATABASE_ID } from '../services/firebaseDb';
import {
  FileSpreadsheet,
  Settings,
  Package,
  Download,
  Calendar,
  PlusCircle,
  ExternalLink,
  Database,
  RefreshCw,
  CheckCircle2,
  MapPin,
  Users,
} from 'lucide-react';

interface HeaderProps {
  currentPeriod: PayrollPeriod;
  allPeriods: PayrollPeriod[];
  currentUser: User | null;
  syncStatus: FirestoreSyncStatus;
  lastSavedAt: string | null;
  activeMainTab: 'payroll' | 'employees';
  allEmployeesCount: number;
  onChangeMainTab: (tab: 'payroll' | 'employees') => void;
  onSelectPeriod: (periodId: string) => void;
  onCreateNewPeriod: () => void;
  onChangeRegion: (region: 1 | 2 | 3 | 4) => void;
  onForceSyncToFirestore: () => void;
  onOpenGoogleSheetsModal: () => void;
  onOpenPieceworkModal: () => void;
  onOpenConfigModal: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPeriod,
  allPeriods,
  currentUser,
  syncStatus,
  lastSavedAt,
  activeMainTab,
  allEmployeesCount,
  onChangeMainTab,
  onSelectPeriod,
  onCreateNewPeriod,
  onChangeRegion,
  onForceSyncToFirestore,
  onOpenGoogleSheetsModal,
  onOpenPieceworkModal,
  onOpenConfigModal,
  onOpenExportModal,
}) => {
  const [showDbInfo, setShowDbInfo] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 shadow-2xs sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-2 gap-2">
          {/* Brand & Firestore Status */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Bảng Lương Doanh Nghiệp
                </h1>

                {/* Firestore Cloud Status Widget */}
                <div className="relative">
                  <button
                    onClick={() => setShowDbInfo(!showDbInfo)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors"
                    title="Dữ liệu được lưu trữ trực tuyến vĩnh viễn trên cơ sở dữ liệu Cloud Firestore"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <Database className="w-3 h-3 text-emerald-700" />
                    <span>
                      {syncStatus === 'syncing'
                        ? 'Đang lưu Firestore...'
                        : 'Firestore Trực Tuyến'}
                    </span>
                  </button>

                  {/* Popover thông tin Firestore */}
                  {showDbInfo && (
                    <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs space-y-2">
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <strong className="text-slate-800 flex items-center gap-1">
                          <Database className="w-3.5 h-3.5 text-blue-600" />
                          Cơ sở dữ liệu Firestore
                        </strong>
                        <button
                          onClick={() => setShowDbInfo(false)}
                          className="text-slate-400 hover:text-slate-600 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-600 space-y-1">
                        <div>
                          Trạng thái:{' '}
                          <span className="font-semibold text-emerald-600">
                            Đã kết nối trực tuyến
                          </span>
                        </div>
                        <div>
                          Số kỳ lương đã lưu: <strong>{allPeriods.length} kỳ</strong>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          DB ID: <span className="font-mono">{FIRESTORE_DATABASE_ID}</span>
                        </div>
                        {lastSavedAt && (
                          <div className="text-[10px] text-slate-400">
                            Lưu gần nhất: {lastSavedAt}
                          </div>
                        )}
                      </div>
                      <div className="pt-1.5 border-t flex justify-end">
                        <button
                          onClick={() => {
                            onForceSyncToFirestore();
                            setShowDbInfo(false);
                          }}
                          className="w-full py-1 text-center bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-[11px] flex items-center justify-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Đồng bộ lên Cloud ngay
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                {currentPeriod.companyName || 'Công ty'} • BHXH DN 21.5% + NLĐ 10.5% = 32%
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Bảng Lương vs Hồ Sơ Nhân Sự) */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl border border-slate-300/80 shadow-2xs">
            <button
              onClick={() => onChangeMainTab('payroll')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                activeMainTab === 'payroll'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <FileSpreadsheet className={`w-4 h-4 ${activeMainTab === 'payroll' ? 'text-white' : 'text-blue-600'}`} />
              <span>Bảng Lương Tháng</span>
            </button>
            <button
              onClick={() => onChangeMainTab('employees')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                activeMainTab === 'employees'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Users className={`w-4 h-4 ${activeMainTab === 'employees' ? 'text-white' : 'text-indigo-600'}`} />
              <span>Hồ Sơ Nhân Sự</span>
              <span
                className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeMainTab === 'employees'
                    ? 'bg-indigo-800 text-white'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {allEmployeesCount}
              </span>
            </button>
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

            {/* Period Selector (chỉ hiện khi xem Bảng Lương) */}
            {activeMainTab === 'payroll' && (
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
            )}

            {/* Google Sheets Trigger */}
            <button
              onClick={onOpenGoogleSheetsModal}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                currentPeriod.googleSpreadsheetId
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Đồng bộ xuất sang Google Sheets"
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
