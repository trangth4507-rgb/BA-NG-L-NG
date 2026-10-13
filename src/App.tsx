/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  PayrollPeriod,
  Employee,
  CalculatedPayrollRow,
  ProductItem,
  TaxInsuranceConfig,
} from './types/payroll';
import {
  loadAllPeriods,
  saveAllPeriods,
  getInitialPayrollPeriod,
} from './services/storage';
import {
  savePeriodToFirestore,
  loadPeriodsFromFirestore,
  subscribeToPeriods,
  testFirestoreConnection,
  deletePeriodFromFirestore,
  saveMasterEmployeesToFirestore,
  saveCompanyProfileToFirestore,
  FirestoreSyncStatus,
} from './services/firebaseDb';
import {
  calculateEmployeeSalary,
  REGIONAL_MINIMUM_SALARIES,
  STATUTORY_BASE_SALARY,
} from './utils/payrollCalculator';
import { initAuth, setCachedAccessToken } from './services/auth';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { PayrollTable } from './components/PayrollTable';
import { EmployeeDirectory } from './components/EmployeeDirectory';
import { EmployeeModal } from './components/EmployeeModal';
import { PayslipModal } from './components/PayslipModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { PieceworkManagerModal } from './components/PieceworkManagerModal';
import { ConfigModal } from './components/ConfigModal';
import { ExportImportModal } from './components/ExportImportModal';
import { Shield, HelpCircle, FileSpreadsheet, Database, Users } from 'lucide-react';

export default function App() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>(() => loadAllPeriods());
  const [activePeriodId, setActivePeriodId] = useState<string>(() => {
    const list = loadAllPeriods();
    return list[0]?.id || 'period_default';
  });

  const [activeMainTab, setActiveMainTab] = useState<'payroll' | 'employees'>('payroll');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<FirestoreSyncStatus>('connecting');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Modals state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [viewingPayslipRow, setViewingPayslipRow] = useState<CalculatedPayrollRow | null>(null);

  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);
  const [isPieceworkModalOpen, setIsPieceworkModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const isInitialSyncDone = useRef(false);

  // 1. Initialize Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setCachedAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setCachedAccessToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // 2. Initialize Firestore Database (Realtime Sync & Permanent Online Storage)
  useEffect(() => {
    async function initFirestore() {
      await testFirestoreConnection();
      try {
        setSyncStatus('syncing');
        const cloudPeriods = await loadPeriodsFromFirestore();
        if (cloudPeriods && cloudPeriods.length > 0) {
          // Normalize old 34% config to exact 32% if needed
          const normalized = cloudPeriods.map(p => {
            if (p.config && p.config.employerUnionRate === 0.02 && !p.config.includeTradeUnionFee) {
              const updated = {
                ...p,
                config: {
                  ...p.config,
                  employerUnionRate: 0,
                  includeTradeUnionFee: false,
                },
              };
              savePeriodToFirestore(updated);
              return updated;
            }
            return p;
          });
          setPeriods(normalized);
          setActivePeriodId(normalized[0].id);
          setSyncStatus('connected');
          setLastSavedAt(new Date().toLocaleTimeString('vi-VN'));
        } else {
          // Seed initial period to Firestore
          const localList = loadAllPeriods();
          if (localList.length > 0) {
            for (const p of localList) {
              await savePeriodToFirestore(p);
            }
            setSyncStatus('connected');
            setLastSavedAt(new Date().toLocaleTimeString('vi-VN'));
          }
        }
      } catch (err) {
        console.warn('Lỗi kết nối Firestore ban đầu:', err);
        setSyncStatus('connected'); // Fallback local ready
      } finally {
        isInitialSyncDone.current = true;
      }

      // Listen for realtime updates from Cloud Firestore
      const unsubscribe = subscribeToPeriods(updatedCloudPeriods => {
        if (updatedCloudPeriods && updatedCloudPeriods.length > 0) {
          setPeriods(updatedCloudPeriods);
          setSyncStatus('connected');
        }
      });

      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }

    initFirestore();
  }, []);

  // 3. Local persistence on state change
  useEffect(() => {
    if (periods.length > 0) {
      saveAllPeriods(periods);
    }
  }, [periods]);

  // Active period
  const activePeriod = useMemo(() => {
    const found = periods.find(p => p.id === activePeriodId);
    if (found) return found;
    return periods[0] || getInitialPayrollPeriod();
  }, [periods, activePeriodId]);

  // Calculate salary rows
  const calculatedRows = useMemo(() => {
    return (activePeriod.employees || []).map(emp =>
      calculateEmployeeSalary(emp, activePeriod.config)
    );
  }, [activePeriod]);

  // Mutator helper: updates state, local storage, and Cloud Firestore simultaneously
  const updateCurrentPeriod = (updater: (prev: PayrollPeriod) => PayrollPeriod) => {
    setSyncStatus('syncing');
    setPeriods(prev => {
      const nextList = prev.map(p => {
        if (p.id === activePeriod.id) {
          const updated = updater(p);
          const finalPeriod: PayrollPeriod = {
            ...updated,
            updatedAt: new Date().toISOString(),
          };
          // Persist directly to Cloud Firestore
          savePeriodToFirestore(finalPeriod)
            .then(() => {
              setSyncStatus('connected');
              setLastSavedAt(new Date().toLocaleTimeString('vi-VN'));
            })
            .catch(() => {
              setSyncStatus('error');
            });
          return finalPeriod;
        }
        return p;
      });
      return nextList;
    });
  };

  // Force sync all data to Cloud Firestore
  const handleForceSyncToFirestore = async () => {
    setSyncStatus('syncing');
    try {
      for (const p of periods) {
        await savePeriodToFirestore(p);
      }
      if (activePeriod.employees) {
        await saveMasterEmployeesToFirestore(activePeriod.employees);
      }
      await saveCompanyProfileToFirestore(
        {
          companyName: activePeriod.companyName,
          companyAddress: activePeriod.companyAddress,
          taxCode: activePeriod.taxCode,
          standardWorkDays: activePeriod.standardWorkDays,
        },
        activePeriod.config
      );
      setSyncStatus('connected');
      setLastSavedAt(new Date().toLocaleTimeString('vi-VN'));
      alert('Đã đồng bộ toàn bộ bảng lương và hồ sơ nhân sự lên cơ sở dữ liệu Firestore thành công!');
    } catch (err) {
      setSyncStatus('error');
      alert('Đồng bộ thất bại, vui lòng kiểm tra kết nối mạng!');
    }
  };

  // Change minimum wage region (Nghị định 74/2024/NĐ-CP)
  const handleChangeRegion = (region: 1 | 2 | 3 | 4) => {
    const minSalary = REGIONAL_MINIMUM_SALARIES[region];
    updateCurrentPeriod(prev => ({
      ...prev,
      config: {
        ...prev.config,
        region,
        regionalMinimumSalary: minSalary,
        maxBhtnBaseSalary: 20 * minSalary,
      },
    }));
  };

  // Quick edit handlers
  const handleQuickUpdateWorkDays = (employeeId: string, days: number) => {
    updateCurrentPeriod(prev => ({
      ...prev,
      employees: prev.employees.map(e =>
        e.id === employeeId ? { ...e, actualWorkDays: days } : e
      ),
    }));
  };

  const handleQuickUpdateBonus = (employeeId: string, bonus: number) => {
    updateCurrentPeriod(prev => ({
      ...prev,
      employees: prev.employees.map(e =>
        e.id === employeeId ? { ...e, bonus } : e
      ),
    }));
  };

  const handleQuickUpdateAdvance = (employeeId: string, advance: number) => {
    updateCurrentPeriod(prev => ({
      ...prev,
      employees: prev.employees.map(e =>
        e.id === employeeId ? { ...e, advancePayment: advance } : e
      ),
    }));
  };

  // Employee CRUD
  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = (savedEmp: Employee) => {
    updateCurrentPeriod(prev => {
      const exists = prev.employees.some(e => e.id === savedEmp.id);
      let updatedList: Employee[];
      if (exists) {
        updatedList = prev.employees.map(e => (e.id === savedEmp.id ? savedEmp : e));
      } else {
        updatedList = [...prev.employees, savedEmp];
      }
      saveMasterEmployeesToFirestore(updatedList);
      return { ...prev, employees: updatedList };
    });
    setIsEmployeeModalOpen(false);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống?')) {
      updateCurrentPeriod(prev => {
        const updatedList = prev.employees.filter(e => e.id !== employeeId);
        saveMasterEmployeesToFirestore(updatedList);
        return {
          ...prev,
          employees: updatedList,
        };
      });
    }
  };

  const handleSyncPersonnelToCurrentPayroll = async () => {
    setSyncStatus('syncing');
    try {
      if (activePeriod.employees && activePeriod.employees.length > 0) {
        await saveMasterEmployeesToFirestore(activePeriod.employees);
        await savePeriodToFirestore(activePeriod);
      }
      setSyncStatus('connected');
      setLastSavedAt(new Date().toLocaleTimeString('vi-VN'));
      alert('Đã đồng bộ toàn bộ danh mục nhân sự và bảng lương lên Cloud Firestore!');
    } catch {
      setSyncStatus('error');
      alert('Đồng bộ thất bại, vui lòng kiểm tra kết nối mạng!');
    }
  };

  // Payslip view
  const handleOpenPayslip = (row: CalculatedPayrollRow) => {
    setViewingPayslipRow(row);
    setIsPayslipModalOpen(true);
  };

  // Create new period
  const handleCreateNewPeriod = () => {
    const nextMonth = activePeriod.month === 12 ? 1 : activePeriod.month + 1;
    const nextYear = activePeriod.month === 12 ? activePeriod.year + 1 : activePeriod.year;
    const newId = `period_${nextYear}_${nextMonth}`;

    const exists = periods.some(p => p.id === newId);
    if (exists) {
      alert(`Kỳ lương Tháng ${nextMonth}/${nextYear} đã tồn tại trong danh sách!`);
      setActivePeriodId(newId);
      return;
    }

    const clonedEmployees: Employee[] = activePeriod.employees.map(e => ({
      ...e,
      actualWorkDays: activePeriod.standardWorkDays,
      bonus: 0,
      advancePayment: 0,
      otherDeductions: 0,
      overtime: { weekdayHours: 0, weekendHours: 0, holidayHours: 0 },
      pieceworkItems: (e.pieceworkItems || []).map(p => ({
        ...p,
        quantity: 0,
        total: 0,
      })),
    }));

    const newPeriod: PayrollPeriod = {
      id: newId,
      month: nextMonth,
      year: nextYear,
      title: `Bảng Lương Tháng ${nextMonth}/${nextYear}`,
      companyName: activePeriod.companyName,
      companyAddress: activePeriod.companyAddress,
      taxCode: activePeriod.taxCode,
      standardWorkDays: activePeriod.standardWorkDays,
      employees: clonedEmployees,
      products: activePeriod.products,
      config: activePeriod.config,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPeriods(prev => [newPeriod, ...prev]);
    setActivePeriodId(newId);
    savePeriodToFirestore(newPeriod);
  };

  // Google Sheets sync info update
  const handleUpdatePeriodSyncInfo = (sheetId: string, sheetUrl: string) => {
    updateCurrentPeriod(prev => ({
      ...prev,
      googleSpreadsheetId: sheetId,
      googleSpreadsheetUrl: sheetUrl,
      lastSyncedAt: new Date().toISOString(),
    }));
  };

  // Piecework products update
  const handleUpdateProducts = (updatedProducts: ProductItem[]) => {
    updateCurrentPeriod(prev => ({
      ...prev,
      products: updatedProducts,
    }));
  };

  // Config & Company update
  const handleSaveConfig = (
    newConfig: TaxInsuranceConfig,
    companyInfo: { companyName: string; companyAddress: string; taxCode: string; standardWorkDays: number }
  ) => {
    updateCurrentPeriod(prev => ({
      ...prev,
      config: newConfig,
      companyName: companyInfo.companyName,
      companyAddress: companyInfo.companyAddress,
      taxCode: companyInfo.taxCode,
      standardWorkDays: companyInfo.standardWorkDays,
    }));
    saveCompanyProfileToFirestore(companyInfo, newConfig);
    setIsConfigModalOpen(false);
  };

  // Restore backup
  const handleRestorePeriods = (restored: PayrollPeriod[]) => {
    setPeriods(restored);
    if (restored[0]) {
      setActivePeriodId(restored[0].id);
      restored.forEach(p => savePeriodToFirestore(p));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans">
      {/* Header gọn gàng với Firestore indicator */}
      <Header
        currentPeriod={activePeriod}
        allPeriods={periods}
        currentUser={currentUser}
        syncStatus={syncStatus}
        lastSavedAt={lastSavedAt}
        activeMainTab={activeMainTab}
        allEmployeesCount={activePeriod.employees?.length || 0}
        onChangeMainTab={setActiveMainTab}
        onSelectPeriod={setActivePeriodId}
        onCreateNewPeriod={handleCreateNewPeriod}
        onChangeRegion={handleChangeRegion}
        onForceSyncToFirestore={handleForceSyncToFirestore}
        onOpenGoogleSheetsModal={() => setIsGoogleSheetsModalOpen(true)}
        onOpenPieceworkModal={() => setIsPieceworkModalOpen(true)}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Navigation Bar nổi bật giúp chuyển đổi ngay lập tức */}
      <div className="bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMainTab('payroll')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeMainTab === 'payroll'
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>BẢNG LƯƠNG THÁNG {activePeriod.month}/{activePeriod.year}</span>
            </button>

            <button
              onClick={() => setActiveMainTab('employees')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeMainTab === 'employees'
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Users className="w-4 h-4 text-indigo-500" />
              <span>HỒ SƠ NHÂN SỰ & NHÂN VIÊN</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                  activeMainTab === 'employees'
                    ? 'bg-indigo-800 text-white'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {activePeriod.employees?.length || 0}
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="hidden md:inline font-medium text-slate-600">
              {activeMainTab === 'payroll' ? '📊 Đang hiển thị Bảng tính lương tự động & BHXH 32%' : '👥 Đang quản lý danh bạ hồ sơ nhân sự toàn công ty'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-5 py-3.5 space-y-3">
        {activeMainTab === 'payroll' ? (
          <>
            {/* KPI Summaries & Statutory Info Bar */}
            <SummaryCards calculatedRows={calculatedRows} config={activePeriod.config} />

            {/* Dense Responsive Data Table */}
            <PayrollTable
              calculatedRows={calculatedRows}
              onSelectPayslip={handleOpenPayslip}
              onEditEmployee={handleOpenEditEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onAddNewEmployee={handleOpenAddEmployee}
              onSwitchToEmployeeDirectory={() => setActiveMainTab('employees')}
              onQuickUpdateWorkDays={handleQuickUpdateWorkDays}
              onQuickUpdateBonus={handleQuickUpdateBonus}
              onQuickUpdateAdvance={handleQuickUpdateAdvance}
            />

            {/* Footnote Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-500 bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>
                  <strong>BHXH 32.0%:</strong> DN đóng 21.5% + NLĐ đóng 10.5%. Lương đóng tách biệt các khoản phụ cấp hỗ trợ.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  <strong>Thuế TNCN:</strong> Giảm trừ 11tr bản thân + 4.4tr phụ thuộc. Miễn thuế ăn trưa tối đa 730k và làm thêm giờ.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Cơ sở dữ liệu Firestore:</strong> Lưu trữ trực tuyến vĩnh viễn và đồng bộ thời gian thực độc lập tuyệt đối.
                </span>
              </div>
            </div>
          </>
        ) : (
          <EmployeeDirectory
            employees={activePeriod.employees || []}
            config={activePeriod.config}
            onAddEmployee={handleOpenAddEmployee}
            onEditEmployee={handleOpenEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onSyncToCurrentPayroll={handleSyncPersonnelToCurrentPayroll}
          />
        )}
      </main>

      {/* Modals */}
      {isEmployeeModalOpen && (
        <EmployeeModal
          employee={editingEmployee}
          products={activePeriod.products}
          standardWorkDays={activePeriod.standardWorkDays}
          onSave={handleSaveEmployee}
          onClose={() => setIsEmployeeModalOpen(false)}
        />
      )}

      {isPayslipModalOpen && viewingPayslipRow && (
        <PayslipModal
          row={viewingPayslipRow}
          period={activePeriod}
          onClose={() => setIsPayslipModalOpen(false)}
        />
      )}

      {isGoogleSheetsModalOpen && (
        <GoogleSheetsModal
          user={currentUser}
          period={activePeriod}
          calculatedRows={calculatedRows}
          onAuthSuccess={(user, token) => {
            setCurrentUser(user);
            setCachedAccessToken(token);
          }}
          onAuthSignOut={() => {
            setCurrentUser(null);
            setCachedAccessToken(null);
          }}
          onUpdatePeriodSyncInfo={handleUpdatePeriodSyncInfo}
          onClose={() => setIsGoogleSheetsModalOpen(false)}
        />
      )}

      {isPieceworkModalOpen && (
        <PieceworkManagerModal
          products={activePeriod.products}
          employees={activePeriod.employees}
          onUpdateProducts={handleUpdateProducts}
          onUpdateEmployeePiecework={emps =>
            updateCurrentPeriod(prev => ({ ...prev, employees: emps }))
          }
          onClose={() => setIsPieceworkModalOpen(false)}
        />
      )}

      {isConfigModalOpen && (
        <ConfigModal
          period={activePeriod}
          onSave={handleSaveConfig}
          onClose={() => setIsConfigModalOpen(false)}
        />
      )}

      {isExportModalOpen && (
        <ExportImportModal
          period={activePeriod}
          allPeriods={periods}
          calculatedRows={calculatedRows}
          onRestorePeriods={handleRestorePeriods}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
}
