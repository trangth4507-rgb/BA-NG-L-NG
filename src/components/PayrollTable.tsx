import React, { useState, useMemo } from 'react';
import { CalculatedPayrollRow, Employee } from '../types/payroll';
import { formatVND, formatNumber } from '../utils/vietnameseCurrency';
import {
  Search,
  Eye,
  Edit2,
  Trash2,
  Plus,
  ShieldCheck,
  AlertTriangle,
  ArrowUpDown,
  Layers,
  Users,
} from 'lucide-react';

interface PayrollTableProps {
  calculatedRows: CalculatedPayrollRow[];
  onSelectPayslip: (row: CalculatedPayrollRow) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
  onAddNewEmployee: () => void;
  onSwitchToEmployeeDirectory?: () => void;
  onQuickUpdateWorkDays: (employeeId: string, days: number) => void;
  onQuickUpdateBonus: (employeeId: string, bonus: number) => void;
  onQuickUpdateAdvance: (employeeId: string, advance: number) => void;
}

type ViewMode = 'full' | 'summary' | 'insurance' | 'piecework';

type SortField =
  | 'code'
  | 'fullName'
  | 'department'
  | 'contractSalary'
  | 'actualWorkDays'
  | 'pieceworkSalary'
  | 'totalGrossIncome'
  | 'totalEmployeeInsurance'
  | 'pitTax'
  | 'netSalary';

export const PayrollTable: React.FC<PayrollTableProps> = ({
  calculatedRows,
  onSelectPayslip,
  onEditEmployee,
  onDeleteEmployee,
  onAddNewEmployee,
  onSwitchToEmployeeDirectory,
  onQuickUpdateWorkDays,
  onQuickUpdateBonus,
  onQuickUpdateAdvance,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [insuranceFilter, setInsuranceFilter] = useState<'ALL' | 'YES' | 'NO'>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortAsc, setSortAsc] = useState(true);

  // Danh sách phòng ban duy nhất
  const departments = useMemo(() => {
    const set = new Set<string>();
    calculatedRows.forEach(r => {
      if (r.employee.department) set.add(r.employee.department);
    });
    return Array.from(set);
  }, [calculatedRows]);

  // Lọc và sắp xếp
  const filteredRows = useMemo(() => {
    return calculatedRows
      .filter(r => {
        const emp = r.employee;
        const matchesSearch =
          searchTerm === '' ||
          emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.department.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;

        const matchesInsurance =
          insuranceFilter === 'ALL' ||
          (insuranceFilter === 'YES' && emp.hasInsurance) ||
          (insuranceFilter === 'NO' && !emp.hasInsurance);

        return matchesSearch && matchesDept && matchesInsurance;
      })
      .sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';

        switch (sortField) {
          case 'code':
            valA = a.employee.code;
            valB = b.employee.code;
            break;
          case 'fullName':
            valA = a.employee.fullName;
            valB = b.employee.fullName;
            break;
          case 'department':
            valA = a.employee.department;
            valB = b.employee.department;
            break;
          case 'contractSalary':
            valA = a.employee.contractSalary;
            valB = b.employee.contractSalary;
            break;
          case 'actualWorkDays':
            valA = a.employee.actualWorkDays;
            valB = b.employee.actualWorkDays;
            break;
          case 'pieceworkSalary':
            valA = a.pieceworkSalary;
            valB = b.pieceworkSalary;
            break;
          case 'totalGrossIncome':
            valA = a.totalGrossIncome;
            valB = b.totalGrossIncome;
            break;
          case 'totalEmployeeInsurance':
            valA = a.totalEmployeeInsurance;
            valB = b.totalEmployeeInsurance;
            break;
          case 'pitTax':
            valA = a.pitTax;
            valB = b.pitTax;
            break;
          case 'netSalary':
            valA = a.netSalary;
            valB = b.netSalary;
            break;
        }

        if (typeof valA === 'string') {
          return sortAsc
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }
        return sortAsc
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });
  }, [calculatedRows, searchTerm, deptFilter, insuranceFilter, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
      {/* Table Toolbar & View Modes */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Left: Search & Filter */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[180px] max-w-xs flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên, mã, phòng ban..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="text-xs px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-700"
          >
            <option value="ALL">Tất cả phòng ban ({departments.length})</option>
            {departments.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={insuranceFilter}
            onChange={e => setInsuranceFilter(e.target.value as 'ALL' | 'YES' | 'NO')}
            className="text-xs px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-700"
          >
            <option value="ALL">Tất cả BHXH</option>
            <option value="YES">Có đóng BHXH</option>
            <option value="NO">Không đóng</option>
          </select>
        </div>

        {/* Right: View Mode Toggle & Add Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* View mode buttons */}
          <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-[11px] font-semibold text-slate-700">
            <button
              onClick={() => setViewMode('summary')}
              className={`px-2 py-1 rounded-md transition-colors ${
                viewMode === 'summary' ? 'bg-white text-blue-700 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              Tổng Quan
            </button>
            <button
              onClick={() => setViewMode('insurance')}
              className={`px-2 py-1 rounded-md transition-colors ${
                viewMode === 'insurance' ? 'bg-white text-blue-700 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              BHXH &amp; Thuế
            </button>
            <button
              onClick={() => setViewMode('piecework')}
              className={`px-2 py-1 rounded-md transition-colors ${
                viewMode === 'piecework' ? 'bg-white text-blue-700 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              Lương Sản Phẩm
            </button>
            <button
              onClick={() => setViewMode('full')}
              className={`px-2 py-1 rounded-md transition-colors ${
                viewMode === 'full' ? 'bg-white text-blue-700 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              Đầy Đủ Cột
            </button>
          </div>

          {onSwitchToEmployeeDirectory && (
            <button
              onClick={onSwitchToEmployeeDirectory}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold shadow-2xs transition-colors shrink-0"
              title="Xem và quản lý toàn bộ hồ sơ nhân sự"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Hồ Sơ Nhân Sự</span>
            </button>
          )}

          <button
            onClick={onAddNewEmployee}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm NV</span>
          </button>
        </div>
      </div>

      {/* Main Table Responsive Container */}
      <div className="overflow-x-auto overflow-y-auto max-h-[620px]">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10 shadow-2xs">
            <tr>
              <th className="px-2.5 py-2 w-10 text-center">STT</th>
              <th
                onClick={() => handleSort('code')}
                className="px-2.5 py-2 cursor-pointer hover:bg-slate-200/70"
              >
                <div className="flex items-center gap-1">
                  Mã NV <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('fullName')}
                className="px-2.5 py-2 cursor-pointer hover:bg-slate-200/70"
              >
                <div className="flex items-center gap-1">
                  Họ và Tên <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="px-2.5 py-2">Phòng Ban</th>

              {/* CỘT THEO VIEW MODE */}
              {(viewMode === 'summary' || viewMode === 'full') && (
                <th
                  onClick={() => handleSort('contractSalary')}
                  className="px-2.5 py-2 text-right cursor-pointer hover:bg-slate-200/70"
                >
                  <div className="flex items-center justify-end gap-1">
                    Lương HĐLĐ <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              )}

              {(viewMode === 'insurance' || viewMode === 'full') && (
                <th className="px-2.5 py-2 text-right bg-amber-50/70 text-amber-900">
                  Lương Đóng BHXH
                </th>
              )}

              {(viewMode === 'summary' || viewMode === 'piecework' || viewMode === 'full') && (
                <th
                  onClick={() => handleSort('actualWorkDays')}
                  className="px-2.5 py-2 text-center cursor-pointer hover:bg-slate-200/70"
                >
                  <div className="flex items-center justify-center gap-1">
                    Ngày Công <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              )}

              {(viewMode === 'summary' || viewMode === 'piecework' || viewMode === 'full') && (
                <th
                  onClick={() => handleSort('pieceworkSalary')}
                  className="px-2.5 py-2 text-right cursor-pointer hover:bg-slate-200/70 bg-blue-50/50 text-blue-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    Lương SP <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              )}

              {(viewMode === 'piecework' || viewMode === 'full') && (
                <th className="px-2.5 py-2 text-center text-slate-600">Sản Phẩm Chi Tiết</th>
              )}

              {(viewMode === 'summary' || viewMode === 'full') && (
                <th className="px-2.5 py-2 text-right">Phụ Cấp Hỗ Trợ</th>
              )}

              {viewMode === 'full' && (
                <>
                  <th className="px-2.5 py-2 text-right">Làm Thêm OT</th>
                  <th className="px-2.5 py-2 text-right">Thưởng</th>
                </>
              )}

              {/* TỔNG GROSS */}
              <th
                onClick={() => handleSort('totalGrossIncome')}
                className="px-2.5 py-2 text-right cursor-pointer hover:bg-slate-200/70 bg-slate-200/50 font-extrabold text-slate-900"
              >
                <div className="flex items-center justify-end gap-1">
                  Tổng Gross <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* BẢO HIỂM */}
              {(viewMode === 'insurance' || viewMode === 'full') && (
                <>
                  <th className="px-2.5 py-2 text-right text-indigo-700">BHXH 8%</th>
                  <th className="px-2.5 py-2 text-right text-indigo-700">BHYT 1.5%</th>
                  <th className="px-2.5 py-2 text-right text-indigo-700">BHTN 1%</th>
                </>
              )}

              <th
                onClick={() => handleSort('totalEmployeeInsurance')}
                className="px-2.5 py-2 text-right cursor-pointer hover:bg-slate-200/70 text-indigo-800 bg-indigo-50/40"
              >
                <div className="flex items-center justify-end gap-1">
                  Tổng BHXH (10.5%) <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* THUẾ TNCN */}
              {(viewMode === 'insurance' || viewMode === 'full') && (
                <th className="px-2.5 py-2 text-right text-slate-600">Thu Nhập Tính Thuế</th>
              )}

              <th
                onClick={() => handleSort('pitTax')}
                className="px-2.5 py-2 text-right cursor-pointer hover:bg-slate-200/70 text-amber-800 bg-amber-50/40"
              >
                <div className="flex items-center justify-end gap-1">
                  Thuế TNCN <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {(viewMode === 'summary' || viewMode === 'full') && (
                <th className="px-2.5 py-2 text-right text-rose-600">Tạm Ứng</th>
              )}

              {/* THỰC LĨNH NET */}
              <th
                onClick={() => handleSort('netSalary')}
                className="px-3 py-2 text-right cursor-pointer hover:bg-emerald-100 bg-emerald-50 font-extrabold text-emerald-800"
              >
                <div className="flex items-center justify-end gap-1">
                  THỰC LĨNH NET <ArrowUpDown className="w-3 h-3 text-emerald-600" />
                </div>
              </th>

              <th className="px-2 py-2 text-center sticky right-0 bg-slate-100 shadow-2xs z-10 w-20">
                Thao Tác
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-[11px] sm:text-xs">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={20} className="px-4 py-8 text-center text-slate-400 text-xs">
                  Không tìm thấy nhân viên nào phù hợp bộ lọc.
                </td>
              </tr>
            ) : (
              filteredRows.map((row, idx) => {
                const emp = row.employee;
                return (
                  <tr
                    key={emp.id}
                    className="hover:bg-blue-50/40 transition-colors group text-slate-700"
                  >
                    <td className="px-2.5 py-2 text-center text-slate-400">{idx + 1}</td>
                    <td className="px-2.5 py-2 font-mono font-semibold text-slate-800">
                      {emp.code}
                    </td>
                    <td className="px-2.5 py-2">
                      <div className="font-semibold text-slate-900 flex items-center gap-1">
                        {emp.fullName}
                        {row.isBelowRegionalMin && (
                          <span
                            title="Cảnh báo: Mức lương đóng BHXH thấp hơn lương tối thiểu vùng theo Nghị định 74/2024/NĐ-CP"
                            className="text-amber-500 cursor-help"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 inline text-amber-500" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{emp.position}</div>
                    </td>
                    <td className="px-2.5 py-2 text-slate-600">{emp.department}</td>

                    {/* Lương HĐLĐ */}
                    {(viewMode === 'summary' || viewMode === 'full') && (
                      <td className="px-2.5 py-2 text-right font-medium text-slate-800">
                        {formatVND(emp.contractSalary)}
                      </td>
                    )}

                    {/* Lương đóng BHXH */}
                    {(viewMode === 'insurance' || viewMode === 'full') && (
                      <td className="px-2.5 py-2 text-right bg-amber-50/30">
                        {emp.hasInsurance ? (
                          <div>
                            <span className="font-bold text-amber-900">
                              {formatVND(row.insuranceBase)}
                            </span>
                            {row.isBelowRegionalMin && (
                              <span className="text-[9px] text-rose-600 block">
                                Dưới sàn tối thiểu vùng
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Không đóng</span>
                        )}
                      </td>
                    )}

                    {/* Ngày công */}
                    {(viewMode === 'summary' || viewMode === 'piecework' || viewMode === 'full') && (
                      <td className="px-2.5 py-2 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="31"
                          value={emp.actualWorkDays}
                          onChange={e =>
                            onQuickUpdateWorkDays(emp.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-12 text-center px-1 py-0.5 border border-slate-200 hover:border-slate-400 focus:border-blue-500 rounded text-xs font-semibold text-blue-700 bg-white"
                          title="Sửa nhanh ngày công"
                        />
                        <span className="text-[10px] text-slate-400 ml-1">/{emp.standardWorkDays}</span>
                      </td>
                    )}

                    {/* Lương sản phẩm */}
                    {(viewMode === 'summary' || viewMode === 'piecework' || viewMode === 'full') && (
                      <td className="px-2.5 py-2 text-right bg-blue-50/20 font-bold text-blue-700">
                        {row.pieceworkSalary > 0 ? formatVND(row.pieceworkSalary) : '-'}
                      </td>
                    )}

                    {/* Chi tiết sản phẩm */}
                    {(viewMode === 'piecework' || viewMode === 'full') && (
                      <td className="px-2.5 py-2 text-center text-[10px] text-slate-500">
                        {emp.pieceworkItems && emp.pieceworkItems.length > 0 ? (
                          <span className="px-1.5 py-0.5 bg-blue-100/70 text-blue-800 rounded font-medium">
                            {emp.pieceworkItems.length} mã SP ({emp.pieceworkItems.reduce((s, p) => s + p.quantity, 0)} cái)
                          </span>
                        ) : (
                          <span className="text-slate-400">Không</span>
                        )}
                      </td>
                    )}

                    {/* Phụ cấp hỗ trợ */}
                    {(viewMode === 'summary' || viewMode === 'full') && (
                      <td className="px-2.5 py-2 text-right text-slate-700 font-medium">
                        {row.totalAllowances > 0 ? formatVND(row.totalAllowances) : '-'}
                      </td>
                    )}

                    {/* Full columns: OT & Bonus */}
                    {viewMode === 'full' && (
                      <>
                        <td className="px-2.5 py-2 text-right text-slate-600">
                          {row.totalOvertimeSalary > 0 ? formatVND(row.totalOvertimeSalary) : '-'}
                        </td>
                        <td className="px-2.5 py-2 text-right">
                          <input
                            type="number"
                            step="100000"
                            min="0"
                            value={emp.bonus}
                            onChange={e =>
                              onQuickUpdateBonus(emp.id, parseFloat(e.target.value) || 0)
                            }
                            className="w-18 text-right px-1 py-0.5 border border-slate-200 rounded text-xs bg-white"
                          />
                        </td>
                      </>
                    )}

                    {/* Tổng Gross */}
                    <td className="px-2.5 py-2 text-right bg-slate-100/60 font-bold text-slate-900">
                      {formatVND(row.totalGrossIncome)}
                    </td>

                    {/* Chi tiết BHXH */}
                    {(viewMode === 'insurance' || viewMode === 'full') && (
                      <>
                        <td className="px-2.5 py-2 text-right text-indigo-700">
                          {formatVND(row.employeeBhxh)}
                        </td>
                        <td className="px-2.5 py-2 text-right text-indigo-700">
                          {formatVND(row.employeeBhyt)}
                        </td>
                        <td className="px-2.5 py-2 text-right text-indigo-700">
                          {formatVND(row.employeeBhtn)}
                        </td>
                      </>
                    )}

                    {/* Tổng BHXH 10.5% */}
                    <td className="px-2.5 py-2 text-right text-indigo-800 font-bold bg-indigo-50/30">
                      {row.totalEmployeeInsurance > 0 ? formatVND(row.totalEmployeeInsurance) : '0 ₫'}
                    </td>

                    {/* Thu nhập tính thuế */}
                    {(viewMode === 'insurance' || viewMode === 'full') && (
                      <td className="px-2.5 py-2 text-right text-slate-600">
                        {row.assessableIncome > 0 ? formatVND(row.assessableIncome) : '0 ₫'}
                      </td>
                    )}

                    {/* Thuế TNCN */}
                    <td className="px-2.5 py-2 text-right text-amber-800 font-bold bg-amber-50/30">
                      {row.pitTax > 0 ? formatVND(row.pitTax) : '0 ₫'}
                    </td>

                    {/* Tạm ứng */}
                    {(viewMode === 'summary' || viewMode === 'full') && (
                      <td className="px-2.5 py-2 text-right">
                        <input
                          type="number"
                          step="100000"
                          min="0"
                          value={emp.advancePayment}
                          onChange={e =>
                            onQuickUpdateAdvance(emp.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-18 text-right px-1 py-0.5 border border-slate-200 rounded text-xs text-rose-600 font-medium bg-white"
                        />
                      </td>
                    )}

                    {/* THỰC LĨNH NET */}
                    <td className="px-3 py-2 text-right bg-emerald-50/80 font-bold text-emerald-800 text-xs sm:text-sm">
                      {formatVND(row.netSalary)}
                    </td>

                    {/* Action buttons */}
                    <td className="px-2 py-2 text-center sticky right-0 bg-white group-hover:bg-blue-50/70 shadow-2xs">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onSelectPayslip(row)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Phiếu lương cá nhân"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditEmployee(emp)}
                          className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                          title="Sửa nhân viên"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteEmployee(emp.id)}
                          className="p-1 text-rose-500 hover:bg-rose-100 rounded transition-colors"
                          title="Xóa nhân viên"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {filteredRows.length > 0 && (
            <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 text-xs">
              <tr>
                <td colSpan={4} className="px-2.5 py-2.5 text-right">
                  TỔNG ({filteredRows.length} NV):
                </td>
                {(viewMode === 'summary' || viewMode === 'full') && (
                  <td className="px-2.5 py-2.5 text-right">
                    {formatVND(filteredRows.reduce((s, r) => s + r.employee.contractSalary, 0))}
                  </td>
                )}
                {(viewMode === 'insurance' || viewMode === 'full') && (
                  <td className="px-2.5 py-2.5 text-right text-amber-900 bg-amber-50">
                    {formatVND(
                      filteredRows.reduce(
                        (s, r) => s + (r.employee.hasInsurance ? r.insuranceBase : 0),
                        0
                      )
                    )}
                  </td>
                )}
                {(viewMode === 'summary' || viewMode === 'piecework' || viewMode === 'full') && (
                  <td className="px-2.5 py-2.5 text-center">
                    {filteredRows.reduce((s, r) => s + r.employee.actualWorkDays, 0)} công
                  </td>
                )}
                {(viewMode === 'summary' || viewMode === 'piecework' || viewMode === 'full') && (
                  <td className="px-2.5 py-2.5 text-right text-blue-700 bg-blue-50">
                    {formatVND(filteredRows.reduce((s, r) => s + r.pieceworkSalary, 0))}
                  </td>
                )}
                {(viewMode === 'piecework' || viewMode === 'full') && <td></td>}
                {(viewMode === 'summary' || viewMode === 'full') && (
                  <td className="px-2.5 py-2.5 text-right">
                    {formatVND(filteredRows.reduce((s, r) => s + r.totalAllowances, 0))}
                  </td>
                )}
                {viewMode === 'full' && (
                  <>
                    <td className="px-2.5 py-2.5 text-right">
                      {formatVND(filteredRows.reduce((s, r) => s + r.totalOvertimeSalary, 0))}
                    </td>
                    <td className="px-2.5 py-2.5 text-right">
                      {formatVND(filteredRows.reduce((s, r) => s + r.bonus, 0))}
                    </td>
                  </>
                )}
                <td className="px-2.5 py-2.5 text-right bg-slate-200/80 font-extrabold">
                  {formatVND(filteredRows.reduce((s, r) => s + r.totalGrossIncome, 0))}
                </td>
                {(viewMode === 'insurance' || viewMode === 'full') && (
                  <>
                    <td className="px-2.5 py-2.5 text-right text-indigo-700">
                      {formatVND(filteredRows.reduce((s, r) => s + r.employeeBhxh, 0))}
                    </td>
                    <td className="px-2.5 py-2.5 text-right text-indigo-700">
                      {formatVND(filteredRows.reduce((s, r) => s + r.employeeBhyt, 0))}
                    </td>
                    <td className="px-2.5 py-2.5 text-right text-indigo-700">
                      {formatVND(filteredRows.reduce((s, r) => s + r.employeeBhtn, 0))}
                    </td>
                  </>
                )}
                <td className="px-2.5 py-2.5 text-right text-indigo-800 font-extrabold bg-indigo-50">
                  {formatVND(filteredRows.reduce((s, r) => s + r.totalEmployeeInsurance, 0))}
                </td>
                {(viewMode === 'insurance' || viewMode === 'full') && (
                  <td className="px-2.5 py-2.5 text-right text-slate-600">
                    {formatVND(filteredRows.reduce((s, r) => s + r.assessableIncome, 0))}
                  </td>
                )}
                <td className="px-2.5 py-2.5 text-right text-amber-800 font-extrabold bg-amber-50">
                  {formatVND(filteredRows.reduce((s, r) => s + r.pitTax, 0))}
                </td>
                {(viewMode === 'summary' || viewMode === 'full') && (
                  <td className="px-2.5 py-2.5 text-right text-rose-600">
                    {formatVND(filteredRows.reduce((s, r) => s + r.advancePayment, 0))}
                  </td>
                )}
                <td className="px-3 py-2.5 text-right bg-emerald-100 text-emerald-900 font-extrabold">
                  {formatVND(filteredRows.reduce((s, r) => s + r.netSalary, 0))}
                </td>
                <td className="sticky right-0 bg-slate-100"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
