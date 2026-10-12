import React, { useState } from 'react';
import { Employee, ProductItem, EmployeePieceworkRecord } from '../types/payroll';
import { formatVND } from '../utils/vietnameseCurrency';
import {
  X,
  Plus,
  Trash2,
  HelpCircle,
  User,
  Shield,
  Briefcase,
  HeartHandshake,
  DollarSign,
} from 'lucide-react';

interface EmployeeModalProps {
  employee: Employee | null; // null nếu là thêm mới
  products: ProductItem[];
  standardWorkDays: number;
  onSave: (employee: Employee) => void;
  onClose: () => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  employee,
  products,
  standardWorkDays,
  onSave,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'salary' | 'piecework' | 'allowances' | 'overtime'>('info');

  const [formData, setFormData] = useState<Employee>(() => {
    if (employee) {
      return JSON.parse(JSON.stringify(employee));
    }
    return {
      id: `emp_${Date.now()}`,
      code: `NV${Math.floor(100 + Math.random() * 900)}`,
      fullName: '',
      department: 'Xưởng Sản Xuất 1',
      position: 'Công nhân',
      phone: '',
      email: '',
      taxId: '',
      dependentsCount: 0,
      hasInsurance: true,
      contractSalary: 6000000,
      insuranceSalary: 6000000,
      standardWorkDays: standardWorkDays || 26,
      actualWorkDays: standardWorkDays || 26,
      pieceworkItems: [],
      overtime: {
        weekdayHours: 0,
        weekendHours: 0,
        holidayHours: 0,
      },
      allowances: {
        lunch: 730000,
        transport: 500000,
        phone: 200000,
        housing: 0,
        childcare: 0,
        attendance: 300000,
        otherTaxFree: 0,
        otherTaxable: 0,
      },
      bonus: 0,
      advancePayment: 0,
      otherDeductions: 0,
      bankAccount: '',
      bankName: '',
      note: '',
    };
  });

  const handlePieceworkAdd = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const existingIdx = formData.pieceworkItems.findIndex(p => p.productId === productId);
    if (existingIdx >= 0) {
      const updated = [...formData.pieceworkItems];
      updated[existingIdx].quantity += 10;
      updated[existingIdx].total = updated[existingIdx].quantity * updated[existingIdx].unitPrice;
      setFormData({ ...formData, pieceworkItems: updated });
    } else {
      const newItem: EmployeePieceworkRecord = {
        productId: prod.id,
        productName: prod.name,
        unit: prod.unit,
        unitPrice: prod.unitPrice,
        quantity: 10,
        total: 10 * prod.unitPrice,
      };
      setFormData({
        ...formData,
        pieceworkItems: [...formData.pieceworkItems, newItem],
      });
    }
  };

  const handlePieceworkQtyChange = (index: number, qty: number) => {
    const updated = [...formData.pieceworkItems];
    updated[index].quantity = Math.max(0, qty);
    updated[index].total = updated[index].quantity * updated[index].unitPrice;
    setFormData({ ...formData, pieceworkItems: updated });
  };

  const handlePieceworkDelete = (index: number) => {
    const updated = formData.pieceworkItems.filter((_, i) => i !== index);
    setFormData({ ...formData, pieceworkItems: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      alert('Vui lòng nhập họ và tên nhân viên!');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl my-6 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {employee ? `Cập Nhật Nhân Viên: ${employee.fullName}` : 'Thêm Nhân Viên Mới Vào Bảng Lương'}
            </h2>
            <p className="text-xs text-slate-500">
              Thiết lập lương cơ bản, lương sản phẩm, BHXH và các khoản phụ cấp hỗ trợ không tính BHXH
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-100/60 overflow-x-auto gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            1. Thông Tin Nhân Sự
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('salary')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'salary'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            2. Lương HĐLĐ &amp; Đóng BHXH
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('piecework')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'piecework'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            3. Lương Sản Phẩm &amp; Ngày Công
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('allowances')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'allowances'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            4. Phụ Cấp &amp; Hỗ Trợ Hàng Tháng
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('overtime')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'overtime'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            5. Làm Thêm Giờ, Tạm Ứng &amp; Thưởng
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {/* TAB 1: THÔNG TIN NHÂN SỰ */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã nhân viên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên nhân viên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn Toàn"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phòng ban / Bộ phận
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Xưởng May, Xưởng Cơ Khí, Kế toán..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chức vụ
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={e => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Công nhân may, Quản đốc, Kế toán..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã số thuế cá nhân (MST)
                </label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                  placeholder="10 số MST cá nhân"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số người phụ thuộc (Giảm trừ 4.400.000đ/người)
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={formData.dependentsCount}
                  onChange={e =>
                    setFormData({ ...formData, dependentsCount: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="098..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email nhận phiếu lương
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@congty.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Giới tính
                </label>
                <select
                  value={formData.gender || 'Nam'}
                  onChange={e => setFormData({ ...formData, gender: e.target.value as 'Nam' | 'Nữ' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  value={formData.birthDate || ''}
                  onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số CCCD / CMND
                </label>
                <input
                  type="text"
                  value={formData.idCard || ''}
                  onChange={e => setFormData({ ...formData, idCard: e.target.value })}
                  placeholder="12 chữ số CCCD"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã số sổ BHXH (10 chữ số)
                </label>
                <input
                  type="text"
                  value={formData.socialInsuranceBookNumber || ''}
                  onChange={e => setFormData({ ...formData, socialInsuranceBookNumber: e.target.value })}
                  placeholder="Mã số BHXH (10 số)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-indigo-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Loại hợp đồng lao động
                </label>
                <select
                  value={formData.contractType || 'HĐ Không xác định thời hạn'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      contractType: e.target.value as Employee['contractType'],
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="HĐ Không xác định thời hạn">HĐ Không xác định thời hạn</option>
                  <option value="HĐ Xác định thời hạn">HĐ Xác định thời hạn (1 - 3 năm)</option>
                  <option value="HĐ Thử việc">HĐ Thử việc</option>
                  <option value="HĐ Thời vụ/Khoán">HĐ Thời vụ / Giao khoán</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày vào làm việc
                </label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trạng thái làm việc
                </label>
                <select
                  value={formData.status || 'active'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Employee['status'],
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="active">Chính thức (Đang làm việc)</option>
                  <option value="probation">Thử việc</option>
                  <option value="leave">Nghỉ chế độ / Thai sản</option>
                  <option value="terminated">Đã thôi việc</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số tài khoản ngân hàng
                </label>
                <input
                  type="text"
                  value={formData.bankAccount || ''}
                  onChange={e => setFormData({ ...formData, bankAccount: e.target.value })}
                  placeholder="Số tài khoản"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên ngân hàng
                </label>
                <input
                  type="text"
                  value={formData.bankName || ''}
                  onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="Vietcombank, Techcombank, MB Bank..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ thường trú / Nơi ở hiện tại
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
          )}

          {/* TAB 2: LƯƠNG HỢP ĐỒNG & BHXH */}
          {activeTab === 'salary' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-200 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  <strong>QUY ĐỊNH TÁCH BIỆT LƯƠNG ĐÓNG BHXH VÀ THU NHẬP THỰC TẾ:</strong>
                  <br />
                  - <strong>Lương cơ bản HĐLĐ:</strong> Là mức lương thỏa thuận trên Hợp đồng, dùng làm căn cứ tính lương ngày công và đơn giá làm thêm giờ (OT).
                  <br />
                  - <strong>Mức lương đóng BHXH:</strong> Là mức tiền lương tháng đăng ký tham gia BHXH (không bao gồm các khoản hỗ trợ xăng xe, ăn trưa, điện thoại, nhà ở, nuôi con).
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lương cơ bản thỏa thuận HĐLĐ (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="100000"
                    min="0"
                    value={formData.contractSalary}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        contractSalary: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold"
                  />
                  <div className="text-[11px] text-slate-500 mt-1">
                    Hiển thị: {formatVND(formData.contractSalary)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Tham gia BHXH bắt buộc?
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasInsurance}
                        onChange={e => setFormData({ ...formData, hasInsurance: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {formData.hasInsurance ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mức lương làm căn cứ đóng BHXH (VNĐ)
                      </label>
                      <input
                        type="number"
                        step="100000"
                        min="0"
                        value={formData.insuranceSalary}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            insuranceSalary: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold text-indigo-700"
                      />
                      <div className="text-[11px] text-indigo-600 mt-1">
                        NLĐ đóng 10.5%: {formatVND(formData.insuranceSalary * 0.105)} | DN đóng 23.5%: {formatVND(formData.insuranceSalary * 0.235)}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-500 italic">
                      Nhân viên này không trích đóng BHXH (ví dụ: đang thử việc, ký HĐ dịch vụ hoặc đã nghỉ hưu).
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LƯƠNG SẢN PHẨM & NGÀY CÔNG */}
          {activeTab === 'piecework' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày công chuẩn trong tháng
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.standardWorkDays}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        standardWorkDays: parseInt(e.target.value, 10) || 26,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày công đi làm thực tế
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="31"
                    value={formData.actualWorkDays}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        actualWorkDays: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold text-blue-700"
                  />
                  <div className="text-[11px] text-slate-500 mt-1">
                    Lương thời gian tạm tính:{' '}
                    {formatVND(
                      Math.round(
                        (formData.contractSalary / (formData.standardWorkDays || 26)) *
                          formData.actualWorkDays
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Danh sách sản phẩm hoàn thành */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Sản phẩm hoàn thành / Lương năng suất
                  </h4>
                  <div className="flex items-center gap-2">
                    <select
                      id="selectProductAdd"
                      className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                      defaultValue=""
                      onChange={e => {
                        if (e.target.value) {
                          handlePieceworkAdd(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="" disabled>
                        + Thêm mã sản phẩm...
                      </option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatVND(p.unitPrice)}/{p.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.pieceworkItems.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                    Chưa có sản phẩm nào được giao cho nhân viên này. Chọn sản phẩm ở danh sách trên để thêm.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2">Tên Sản Phẩm</th>
                          <th className="px-3 py-2 w-24">Đơn vị</th>
                          <th className="px-3 py-2 w-28 text-right">Đơn giá</th>
                          <th className="px-3 py-2 w-32 text-center">Số lượng</th>
                          <th className="px-3 py-2 w-32 text-right">Thành tiền</th>
                          <th className="px-3 py-2 w-12 text-center">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {formData.pieceworkItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2 font-medium text-slate-800">
                              {item.productName}
                            </td>
                            <td className="px-3 py-2 text-slate-500">{item.unit}</td>
                            <td className="px-3 py-2 text-right text-slate-600">
                              {formatVND(item.unitPrice)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="number"
                                min="0"
                                value={item.quantity}
                                onChange={e =>
                                  handlePieceworkQtyChange(idx, parseInt(e.target.value, 10) || 0)
                                }
                                className="w-24 text-center px-2 py-1 border border-slate-300 rounded font-semibold focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                              />
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-blue-700">
                              {formatVND(item.quantity * item.unitPrice)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handlePieceworkDelete(idx)}
                                className="text-slate-400 hover:text-red-500 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 font-semibold border-t border-slate-200">
                        <tr>
                          <td colSpan={4} className="px-3 py-2 text-right text-slate-600">
                            Tổng Lương Sản Phẩm:
                          </td>
                          <td className="px-3 py-2 text-right text-blue-700 font-bold">
                            {formatVND(
                              formData.pieceworkItems.reduce((s, it) => s + it.quantity * it.unitPrice, 0)
                            )}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PHỤ CẤP & HỖ TRỢ HÀNG THÁNG (KHÔNG TÍNH ĐÓNG BHXH) */}
          {activeTab === 'allowances' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong>ĐẶC ĐIỂM QUAN TRỌNG:</strong> Toàn bộ các khoản hỗ trợ bên dưới{' '}
                <span className="underline font-bold text-amber-800">
                  KHÔNG ĐƯA VÀO CĂN CỨ TÍNH ĐÓNG BHXH
                </span>{' '}
                (theo Thông tư 06/2021/TT-BLĐTBXH). Người lao động nhận trọn vẹn số tiền này.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    1. Hỗ trợ ăn trưa / giữa ca (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    min="0"
                    value={formData.allowances.lunch}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        allowances: {
                          ...formData.allowances,
                          lunch: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <div className="text-[11px] text-slate-500 mt-1">
                    Miễn thuế TNCN tối đa 730.000đ/tháng
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    2. Hỗ trợ xăng xe / đi lại (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    min="0"
                    value={formData.allowances.transport}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        allowances: {
                          ...formData.allowances,
                          transport: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    3. Hỗ trợ điện thoại / liên lạc (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    min="0"
                    value={formData.allowances.phone}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        allowances: {
                          ...formData.allowances,
                          phone: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    4. Hỗ trợ tiền nhà ở / lưu trú (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    min="0"
                    value={formData.allowances.housing}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        allowances: {
                          ...formData.allowances,
                          housing: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    5. Hỗ trợ con nhỏ / nuôi con (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    min="0"
                    value={formData.allowances.childcare}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        allowances: {
                          ...formData.allowances,
                          childcare: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    6. Thưởng chuyên cần tháng (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    min="0"
                    value={formData.allowances.attendance}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        allowances: {
                          ...formData.allowances,
                          attendance: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    7. Phụ cấp trách nhiệm / chịu thuế TNCN (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    min="0"
                    value={formData.allowances.otherTaxable}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        allowances: {
                          ...formData.allowances,
                          otherTaxable: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    8. Khoản hỗ trợ khác miễn thuế (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    min="0"
                    value={formData.allowances.otherTaxFree}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        allowances: {
                          ...formData.allowances,
                          otherTaxFree: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LÀM THÊM GIỜ, TẠM ỨNG & THƯỞNG */}
          {activeTab === 'overtime' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Số giờ làm thêm (Overtime - OT)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      Giờ ngày thường (150%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.overtime.weekdayHours}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          overtime: {
                            ...formData.overtime,
                            weekdayHours: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      Giờ ngày nghỉ tuần (200%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.overtime.weekendHours}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          overtime: {
                            ...formData.overtime,
                            weekendHours: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      Giờ lễ, Tết (300%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.overtime.holidayHours}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          overtime: {
                            ...formData.overtime,
                            holidayHours: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tiền thưởng thêm / KPI (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="100000"
                    min="0"
                    value={formData.bonus}
                    onChange={e =>
                      setFormData({ ...formData, bonus: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tạm ứng lương trong tháng (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="100000"
                    min="0"
                    value={formData.advancePayment}
                    onChange={e =>
                      setFormData({ ...formData, advancePayment: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-rose-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Các khoản giảm trừ khác (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    min="0"
                    value={formData.otherDeductions}
                    onChange={e =>
                      setFormData({ ...formData, otherDeductions: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú nội bộ
                </label>
                <textarea
                  rows={2}
                  value={formData.note || ''}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Ghi chú về thành tích, lý do phạt hoặc phụ cấp..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              {employee ? 'Lưu Thay Đổi Nhân Viên' : 'Thêm Nhân Viên Vào Bảng Lương'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
