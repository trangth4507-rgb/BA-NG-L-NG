import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { PayrollPeriod, CalculatedPayrollRow } from '../types/payroll';
import {
  googleSignIn,
  getAccessToken,
  logout,
} from '../services/auth';
import {
  createPayrollSpreadsheet,
  syncPayrollToSpreadsheet,
  listUserPayrollSheets,
} from '../services/googleSheets';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  FolderOpen,
  Send,
} from 'lucide-react';

interface GoogleSheetsModalProps {
  user: User | null;
  period: PayrollPeriod;
  calculatedRows: CalculatedPayrollRow[];
  onAuthSuccess: (user: User, token: string) => void;
  onAuthSignOut: () => void;
  onUpdatePeriodSyncInfo: (id: string, url: string) => void;
  onClose: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  user,
  period,
  calculatedRows,
  onAuthSuccess,
  onAuthSignOut,
  onUpdatePeriodSyncInfo,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<Array<{ id: string; name: string; webViewLink?: string }>>([]);
  const [customSheetId, setCustomSheetId] = useState(period.googleSpreadsheetId || '');

  // Confirm dialog state for destructive/mutating operation
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'create' | 'sync' | null>(null);

  useEffect(() => {
    if (user) {
      loadDriveFiles();
    }
  }, [user]);

  const loadDriveFiles = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;
      const files = await listUserPayrollSheets(token);
      setDriveFiles(files);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await googleSignIn();
      if (res) {
        onAuthSuccess(res.user, res.accessToken);
        const files = await listUserPayrollSheets(res.accessToken);
        setDriveFiles(files);
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || 'Đăng nhập Google thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    onAuthSignOut();
  };

  const requestCreateNew = () => {
    setError(null);
    setSuccessMessage(null);
    setConfirmAction('create');
    setShowConfirm(true);
  };

  const requestSyncExisting = () => {
    if (!customSheetId.trim()) {
      setError('Vui lòng nhập ID hoặc đường link Google Spreadsheet để đồng bộ!');
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setConfirmAction('sync');
    setShowConfirm(true);
  };

  const extractSpreadsheetId = (input: string): string => {
    const trimmed = input.trim();
    const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      return match[1];
    }
    return trimmed;
  };

  const executeConfirmedAction = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Phiên làm việc hết hạn. Vui lòng đăng nhập lại Google.');
      }

      if (confirmAction === 'create') {
        const result = await createPayrollSpreadsheet(token, period, calculatedRows);
        onUpdatePeriodSyncInfo(result.spreadsheetId, result.spreadsheetUrl);
        setCustomSheetId(result.spreadsheetId);
        setSuccessMessage('Đã tạo mới và đồng bộ bảng lương thành công lên Google Sheets!');
        loadDriveFiles();
      } else if (confirmAction === 'sync') {
        const id = extractSpreadsheetId(customSheetId);
        await syncPayrollToSpreadsheet(token, id, period, calculatedRows);
        const url = `https://docs.google.com/spreadsheets/d/${id}/edit`;
        onUpdatePeriodSyncInfo(id, url);
        setSuccessMessage('Đã cập nhật bảng lương thành công vào Google Sheet!');
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || 'Đã xảy ra lỗi khi tương tác với Google Sheets API');
    } finally {
      setLoading(false);
      setConfirmAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl my-6 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Tích Hợp &amp; Đồng Bộ Google Sheets
              </h2>
              <p className="text-xs text-slate-500">
                Lưu trữ vĩnh viễn bảng lương, chia sẻ với lãnh đạo và nhân viên trên Google Drive
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

        <div className="p-6 space-y-6">
          {/* User Auth Section */}
          {!user ? (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">
                  Đăng nhập tài khoản Google để kích hoạt Google Sheets
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Ứng dụng sẽ yêu cầu quyền đọc và ghi bảng tính trên Google Drive của bạn (với sự cho phép của bạn) để lưu trữ vĩnh viễn dữ liệu bảng lương.
                </p>
              </div>

              <div>
                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl shadow-xs text-xs font-semibold transition-all hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  {loading ? 'Đang kết nối...' : 'Đăng nhập bằng tài khoản Google'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'G'}
                  </div>
                  <div>
                    <div className="font-semibold text-emerald-950">
                      {user.displayName || 'Google Account'}
                    </div>
                    <div className="text-emerald-700">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 font-medium px-2.5 py-1 rounded-md hover:bg-white transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Đăng xuất
                </button>
              </div>

              {/* Status Alert */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <div>
                    <p className="font-semibold">{successMessage}</p>
                    {period.googleSpreadsheetUrl && (
                      <a
                        href={period.googleSpreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-emerald-800 underline font-bold"
                      >
                        Mở Google Sheet ngay <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Action 1: Create New Sheet */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Tùy chọn 1: Tạo Bảng Tính Mới Tự Động
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tự động tạo 1 file Google Spreadsheet mới mang tên kỳ lương với đầy đủ 3 trang tính (Bảng Lương Tổng Hợp, Chi Tiết Phụ Cấp &amp; Tăng Ca, BHXH &amp; Thuế TNCN).
                    </p>
                  </div>
                  <button
                    onClick={requestCreateNew}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Tạo Bảng Tính Mới
                  </button>
                </div>
              </div>

              {/* Action 2: Sync to Existing Sheet */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Tùy chọn 2: Đồng Bộ Vào Bảng Tính Đã Có
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Dán URL hoặc Spreadsheet ID của bảng tính Google Sheets bạn đang quản lý để cập nhật đè số liệu.
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/d/... hoặc ID bảng tính"
                    value={customSheetId}
                    onChange={e => setCustomSheetId(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    onClick={requestSyncExisting}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Cập Nhật Lên Sheet
                  </button>
                </div>

                {period.googleSpreadsheetUrl && (
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                    <span className="text-slate-500">Bảng tính đang liên kết với kỳ lương này:</span>
                    <a
                      href={period.googleSpreadsheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Mở trên Google Sheets <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Drive files list */}
              {driveFiles.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                    Bảng tính gần đây trên Google Drive của bạn
                  </h4>
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                    {driveFiles.map(file => (
                      <div
                        key={file.id}
                        className="p-2.5 hover:bg-slate-50 flex items-center justify-between gap-2"
                      >
                        <div className="truncate">
                          <span className="font-medium text-slate-800">{file.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            ID: {file.id}
                          </span>
                        </div>
                        <button
                          onClick={() => setCustomSheetId(file.id)}
                          className="px-2 py-1 text-[11px] text-blue-600 hover:bg-blue-50 rounded border border-blue-200 shrink-0"
                        >
                          Chọn ID này
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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

      {/* CONFIRMATION DIALOG (Mandatory Workspace Skill Safety Requirement) */}
      {showConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Xác Nhận Thao Tác Google Sheets
                </h3>
                <p className="text-xs text-slate-500">
                  Thao tác sẽ tạo mới hoặc ghi đè dữ liệu lên Google Drive của bạn
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1.5 border border-slate-200">
              <div className="flex justify-between">
                <span>Hành động:</span>
                <strong className="text-slate-800">
                  {confirmAction === 'create'
                    ? 'Tạo bảng tính mới'
                    : 'Ghi đè dữ liệu vào bảng tính'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Kỳ lương:</span>
                <span className="font-medium text-slate-800">
                  Tháng {period.month}/{period.year}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Số lượng nhân viên:</span>
                <span className="font-bold text-blue-700">{calculatedRows.length} nhân sự</span>
              </div>
              <div className="flex justify-between">
                <span>Các sheet sẽ cập nhật:</span>
                <span className="font-medium text-slate-800">
                  3 sheet (Tổng hợp, Phụ cấp &amp; Tăng ca, BHXH &amp; Thuế)
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={executeConfirmedAction}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Xác Nhận Thực Hiện
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
