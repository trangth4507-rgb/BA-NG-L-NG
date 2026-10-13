import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Employee, TaxInsuranceConfig } from '../types/payroll';
import { formatVND } from '../utils/vietnameseCurrency';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Download,
  Eye,
  ShieldCheck,
  ShieldAlert,
  ArrowUpDown,
  UserCheck,
  Briefcase,
  Calendar,
  CreditCard,
  Building,
  RefreshCw,
  Phone,
  Mail,
  X,
  Printer,
  ArrowLeft,
} from 'lucide-react';

interface EmployeeDirectoryProps {
  employees: Employee[];
  config: TaxInsuranceConfig;
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
  onSyncToCurrentPayroll: () => void;
  onBackToPayroll?: () => void;
}

export const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = ({
  employees,
  config,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onSyncToCurrentPayroll,
  onBackToPayroll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [insuranceFilter, setInsuranceFilter] = useState('ALL');
  const [viewingProfile, setViewingProfile] = useState<Employee | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<'code' | 'fullName' | 'department' | 'startDate' | 'contractSalary'>('code');
  const [sortAsc, setSortAsc] = useState(true);

  // Unique departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [employees]);

  // HR metrics
  const metrics = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => !e.status || e.status === 'active').length;
    const probation = employees.filter(e => e.status === 'probation').length;
    const insured = employees.filter(e => e.hasInsurance).length;
    const totalSalaryFund = employees.reduce((s, e) => s + (e.contractSalary || 0), 0);
    const totalInsSalary = employees.reduce((s, e) => s + (e.hasInsurance ? e.insuranceSalary || e.contractSalary : 0), 0);
    return { total, active, probation, insured, totalSalaryFund, totalInsSalary };
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees
      .filter(e => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          searchTerm === '' ||
          e.fullName.toLowerCase().includes(term) ||
          e.code.toLowerCase().includes(term) ||
          (e.idCard && e.idCard.includes(term)) ||
          (e.socialInsuranceBookNumber && e.socialInsuranceBookNumber.includes(term)) ||
          (e.phone && e.phone.includes(term)) ||
          (e.department && e.department.toLowerCase().includes(term));

        const matchesDept = deptFilter === 'ALL' || e.department === deptFilter;
        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'active' && (!e.status || e.status === 'active')) ||
          e.status === statusFilter;

        const matchesInsurance =
          insuranceFilter === 'ALL' ||
          (insuranceFilter === 'YES' && e.hasInsurance) ||
          (insuranceFilter === 'NO' && !e.hasInsurance);

        return matchesSearch && matchesDept && matchesStatus && matchesInsurance;
      })
      .sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';
        if (sortField === 'code') {
          valA = a.code;
          valB = b.code;
        } else if (sortField === 'fullName') {
          valA = a.fullName;
          valB = b.fullName;
        } else if (sortField === 'department') {
          valA = a.department;
          valB = b.department;
        } else if (sortField === 'startDate') {
          valA = a.startDate || '';
          valB = b.startDate || '';
        } else if (sortField === 'contractSalary') {
          valA = a.contractSalary;
          valB = b.contractSalary;
        }

        if (typeof valA === 'string') {
          return sortAsc
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }
        return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [employees, searchTerm, deptFilter, statusFilter, insuranceFilter, sortField, sortAsc]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Xuất file Excel hồ sơ nhân sự
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const data: (string | number)[][] = [
      ['DANH SÁCH HỒ SƠ NHÂN SỰ TOÀN DOANH NGHIỆP'],
      [`Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')} - Tổng số: ${filteredEmployees.length} nhân sự`],
      [],
      [
        'STT',
        'Mã NV',
        'Họ và tên',
        'Giới tính',
        'Ngày sinh',
        'Số CCCD / CMND',
        'Mã số BHXH (10 số)',
        'Phòng ban',
        'Chức vụ',
        'Loại HĐLĐ',
        'Ngày vào làm',
        'Lương HĐLĐ (VNĐ)',
        'Lương đóng BHXH (VNĐ)',
        'Tham gia BHXH',
        'MST cá nhân',
        'Người phụ thuộc',
        'Số điện thoại',
        'Email',
        'Tài khoản ngân hàng',
        'Tên ngân hàng',
        'Trạng thái',
      ],
    ];

    filteredEmployees.forEach((emp, idx) => {
      data.push([
        idx + 1,
        emp.code,
        emp.fullName,
        emp.gender || '---',
        emp.birthDate || '---',
        emp.idCard || '---',
        emp.socialInsuranceBookNumber || '---',
        emp.department,
        emp.position,
        emp.contractType || 'HĐ Không xác định thời hạn',
        emp.startDate || '---',
        emp.contractSalary,
        emp.hasInsurance ? emp.insuranceSalary : 0,
        emp.hasInsurance ? 'Có' : 'Không',
        emp.taxId || '---',
        emp.dependentsCount || 0,
        emp.phone || '---',
        emp.email || '---',
        emp.bankAccount || '---',
        emp.bankName || '---',
        emp.status === 'probation' ? 'Thử việc' : emp.status === 'terminated' ? 'Đã nghỉ' : 'Chính thức',
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Ho_So_Nhan_Su');
    XLSX.writeFile(wb, `Danh_Sach_Ho_So_Nhan_Su_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-3">
      {/* Thanh điều hướng nhanh trở lại Bảng Lương */}
      {onBackToPayroll && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white px-4 py-2.5 rounded-xl border border-indigo-700/60 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <span className="text-xs font-bold tracking-wide uppercase">
                DANH BẠ HỒ SƠ NHÂN SỰ & QUẢN LÝ LAO ĐỘNG
              </span>
              <span className="ml-2 text-[11px] font-semibold text-indigo-200">
                ({metrics.total} nhân sự • Quỹ lương {formatVND(metrics.totalSalaryFund)})
              </span>
            </div>
          </div>
          <button
            onClick={onBackToPayroll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Quay Lại Bảng Lương Tháng</span>
          </button>
        </div>
      )}

      {/* 4 Thẻ KPI Hồ Sơ Nhân Sự Gọn Gàng */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Tổng Nhân Sự
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">
              {metrics.total} <span className="text-xs font-normal text-slate-500">nhân sự</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Chính thức: <strong className="text-emerald-700">{metrics.active}</strong> • Thử việc: <strong className="text-amber-700">{metrics.probation}</strong>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
              Tham Gia BHXH (32%)
            </div>
            <div className="text-xl font-bold text-indigo-800 mt-0.5">
              {metrics.insured}/{metrics.total}{' '}
              <span className="text-xs font-normal text-slate-500">
                ({metrics.total > 0 ? Math.round((metrics.insured / metrics.total) * 100) : 0}%)
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Quỹ lương đóng BHXH: <strong className="text-indigo-700">{formatVND(metrics.totalInsSalary)}</strong>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Tổng Quỹ Lương HĐLĐ
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">
              {formatVND(metrics.totalSalaryFund)}
            </div>
            <div className="text-[11px] text-slate-500">
              Bình quân: <strong className="text-slate-800">{formatVND(metrics.total > 0 ? Math.round(metrics.totalSalaryFund / metrics.total) : 0)}</strong>/NV
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Phòng Ban &amp; Bộ Phận
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">
              {departments.length} <span className="text-xs font-normal text-slate-500">bộ phận</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Quản lý sản xuất, may mặc, QC, VP
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Building className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Toolbar & Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
        <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative min-w-[200px] max-w-xs flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên, mã NV, CCCD, sổ BHXH..."
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
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-700"
            >
              <option value="ALL">Mọi trạng thái làm việc</option>
              <option value="active">Chính thức</option>
              <option value="probation">Thử việc</option>
              <option value="terminated">Đã nghỉ việc</option>
            </select>

            <select
              value={insuranceFilter}
              onChange={e => setInsuranceFilter(e.target.value)}
              className="text-xs px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-700"
            >
              <option value="ALL">Tất cả chế độ BHXH</option>
              <option value="YES">Có tham gia BHXH</option>
              <option value="NO">Không tham gia</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onSyncToCurrentPayroll}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              title="Đồng bộ danh sách nhân sự này sang bảng lương kỳ đang xem"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đồng Bộ Vào Bảng Lương</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
              title="Tải file Excel hồ sơ nhân sự"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất Excel</span>
            </button>

            <button
              onClick={onAddEmployee}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Nhân Viên</span>
            </button>
          </div>
        </div>

        {/* Table view */}
        <div className="overflow-x-auto overflow-y-auto max-h-[640px]">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10 shadow-2xs text-[11px] sm:text-xs">
              <tr>
                <th className="px-2.5 py-2 w-10 text-center">STT</th>
                <th
                  onClick={() => handleSort('code')}
                  className="px-2.5 py-2 cursor-pointer hover:bg-slate-200"
                >
                  <div className="flex items-center gap-1">
                    Mã NV <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('fullName')}
                  className="px-2.5 py-2 cursor-pointer hover:bg-slate-200"
                >
                  <div className="flex items-center gap-1">
                    Họ và Tên <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-2.5 py-2">Giới Tính / Ngày Sinh</th>
                <th className="px-2.5 py-2">Số CCCD / CMND</th>
                <th className="px-2.5 py-2 bg-indigo-50/50 text-indigo-900">Mã Số Sổ BHXH</th>
                <th
                  onClick={() => handleSort('department')}
                  className="px-2.5 py-2 cursor-pointer hover:bg-slate-200"
                >
                  <div className="flex items-center gap-1">
                    Phòng Ban / Chức Vụ <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-2.5 py-2">Loại Hợp Đồng</th>
                <th
                  onClick={() => handleSort('startDate')}
                  className="px-2.5 py-2 cursor-pointer hover:bg-slate-200"
                >
                  <div className="flex items-center gap-1">
                    Ngày Vào Làm <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('contractSalary')}
                  className="px-2.5 py-2 text-right cursor-pointer hover:bg-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    Lương HĐLĐ <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-2.5 py-2 text-right bg-amber-50/60 text-amber-900">
                  Lương Đóng BHXH
                </th>
                <th className="px-2.5 py-2 text-center">Người Phụ Thuộc</th>
                <th className="px-2.5 py-2">Tài Khoản NH</th>
                <th className="px-2.5 py-2 text-center">Trạng Thái</th>
                <th className="px-2.5 py-2 text-center sticky right-0 bg-slate-100 shadow-2xs z-10 w-20">
                  Thao Tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-[11px] sm:text-xs">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-4 py-8 text-center text-slate-400 text-xs">
                    Không tìm thấy nhân viên phù hợp tiêu chí tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, idx) => (
                  <tr key={emp.id} className="hover:bg-blue-50/40 transition-colors group text-slate-700">
                    <td className="px-2.5 py-2 text-center text-slate-400">{idx + 1}</td>
                    <td className="px-2.5 py-2 font-mono font-bold text-slate-800">{emp.code}</td>
                    <td className="px-2.5 py-2">
                      <div className="font-semibold text-slate-900">{emp.fullName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        {emp.phone && <span>{emp.phone}</span>}
                        {emp.email && <span>{emp.email}</span>}
                      </div>
                    </td>
                    <td className="px-2.5 py-2 text-slate-600">
                      <div>{emp.gender || '---'}</div>
                      <div className="text-[10px] text-slate-400">{emp.birthDate || '---'}</div>
                    </td>
                    <td className="px-2.5 py-2 font-mono text-slate-700">
                      {emp.idCard || <span className="text-slate-300 italic">Chưa nhập</span>}
                    </td>
                    <td className="px-2.5 py-2 font-mono font-semibold text-indigo-700 bg-indigo-50/30">
                      {emp.socialInsuranceBookNumber ? (
                        <span>{emp.socialInsuranceBookNumber}</span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa có sổ</span>
                      )}
                    </td>
                    <td className="px-2.5 py-2">
                      <div className="text-slate-800 font-medium">{emp.department}</div>
                      <div className="text-[10px] text-slate-400">{emp.position}</div>
                    </td>
                    <td className="px-2.5 py-2 text-slate-600">
                      {emp.contractType || 'HĐ Không xác định thời hạn'}
                    </td>
                    <td className="px-2.5 py-2 text-slate-600">{emp.startDate || '---'}</td>
                    <td className="px-2.5 py-2 text-right font-semibold text-slate-900">
                      {formatVND(emp.contractSalary)}
                    </td>
                    <td className="px-2.5 py-2 text-right bg-amber-50/30 font-bold text-amber-900">
                      {emp.hasInsurance ? formatVND(emp.insuranceSalary) : <span className="text-slate-400 font-normal italic">Không đóng</span>}
                    </td>
                    <td className="px-2.5 py-2 text-center text-slate-700">
                      {emp.dependentsCount || 0} người
                    </td>
                    <td className="px-2.5 py-2 text-[10px] text-slate-600">
                      {emp.bankAccount ? (
                        <div>
                          <div className="font-mono font-medium">{emp.bankAccount}</div>
                          <div className="text-slate-400">{emp.bankName || 'Ngân hàng'}</div>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic">Tiền mặt</span>
                      )}
                    </td>
                    <td className="px-2.5 py-2 text-center">
                      {emp.status === 'probation' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Thử việc
                        </span>
                      ) : emp.status === 'terminated' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Đã nghỉ
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Chính thức
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-center sticky right-0 bg-white group-hover:bg-blue-50/70 shadow-2xs">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewingProfile(emp)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Xem hồ sơ nhân sự chi tiết"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditEmployee(emp)}
                          className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                          title="Sửa hồ sơ"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteEmployee(emp.id)}
                          className="p-1 text-rose-500 hover:bg-rose-100 rounded transition-colors"
                          title="Xóa nhân sự"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Profile Card Chi Tiết Nhân Sự */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {viewingProfile.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{viewingProfile.fullName}</h3>
                  <p className="text-xs text-slate-500">Mã NV: {viewingProfile.code} • {viewingProfile.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                  title="In hồ sơ"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewingProfile(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Giới tính:</span>
                  <strong className="text-slate-800">{viewingProfile.gender || 'Chưa cập nhật'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Ngày sinh:</span>
                  <strong className="text-slate-800">{viewingProfile.birthDate || 'Chưa cập nhật'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Số CCCD:</span>
                  <strong className="text-slate-800 font-mono">{viewingProfile.idCard || 'Chưa cập nhật'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Mã số sổ BHXH:</span>
                  <strong className="text-indigo-700 font-mono">{viewingProfile.socialInsuranceBookNumber || 'Chưa có'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Mã số thuế:</span>
                  <strong className="text-slate-800 font-mono">{viewingProfile.taxId || 'Chưa có'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Người phụ thuộc:</span>
                  <strong className="text-slate-800">{viewingProfile.dependentsCount || 0} người</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Phòng ban:</span>
                  <strong className="text-slate-800">{viewingProfile.department}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Chức vụ:</span>
                  <strong className="text-slate-800">{viewingProfile.position}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Loại HĐLĐ:</span>
                  <strong className="text-slate-800">{viewingProfile.contractType || 'HĐ Không xác định thời hạn'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Ngày vào làm:</span>
                  <strong className="text-slate-800">{viewingProfile.startDate || 'Chưa cập nhật'}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">Lương cơ bản HĐLĐ:</span>
                  <strong className="text-base font-bold text-blue-900">{formatVND(viewingProfile.contractSalary)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Mức lương làm căn cứ đóng BHXH:</span>
                  <strong className="text-base font-bold text-indigo-700">
                    {viewingProfile.hasInsurance ? formatVND(viewingProfile.insuranceSalary) : 'Không tham gia BHXH'}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{viewingProfile.phone || 'Chưa có SĐT'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{viewingProfile.email || 'Chưa có email'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-3 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => {
                  setViewingProfile(null);
                  onEditEmployee(viewingProfile);
                }}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
              >
                Chỉnh Sửa Hồ Sơ Này
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
