import React, { useState } from 'react';
import { ProductItem, Employee } from '../types/payroll';
import { formatVND, formatNumber } from '../utils/vietnameseCurrency';
import { X, Plus, Trash2, Edit2, Check, Package, Layers } from 'lucide-react';

interface PieceworkManagerModalProps {
  products: ProductItem[];
  employees: Employee[];
  onUpdateProducts: (products: ProductItem[]) => void;
  onUpdateEmployeePiecework: (employees: Employee[]) => void;
  onClose: () => void;
}

export const PieceworkManagerModal: React.FC<PieceworkManagerModalProps> = ({
  products,
  employees,
  onUpdateProducts,
  onUpdateEmployeePiecework,
  onClose,
}) => {
  const [productList, setProductList] = useState<ProductItem[]>(products);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New product form
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('Chiếc');
  const [newPrice, setNewPrice] = useState<number>(50000);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newPrice <= 0) {
      alert('Vui lòng nhập tên sản phẩm và đơn giá hợp lệ!');
      return;
    }
    const item: ProductItem = {
      id: `prod_${Date.now()}`,
      code: newCode.trim() || `SP-${productList.length + 1}`,
      name: newName.trim(),
      unit: newUnit.trim() || 'Chiếc',
      unitPrice: newPrice,
    };
    const updated = [...productList, item];
    setProductList(updated);
    onUpdateProducts(updated);
    setNewCode('');
    setNewName('');
    setNewPrice(50000);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa mã sản phẩm này khỏi danh mục?')) {
      const updated = productList.filter(p => p.id !== id);
      setProductList(updated);
      onUpdateProducts(updated);
    }
  };

  // Thống kê sản lượng đã hoàn thành theo sản phẩm
  const productStats = productList.map(prod => {
    let totalQty = 0;
    employees.forEach(emp => {
      (emp.pieceworkItems || []).forEach(item => {
        if (item.productId === prod.id) {
          totalQty += item.quantity;
        }
      });
    });
    return {
      ...prod,
      totalQty,
      totalMoney: totalQty * prod.unitPrice,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl my-6 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Quản Lý Đơn Giá Lương Sản Phẩm &amp; Năng Suất
              </h2>
              <p className="text-xs text-slate-500">
                Định nghĩa danh mục sản phẩm, đơn giá gia công và theo dõi tiến độ sản xuất
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

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Form thêm sản phẩm mới */}
          <form
            onSubmit={handleAddProduct}
            className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-3"
          >
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              Thêm Mã Sản Phẩm / Công Đoạn Mới
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Mã sản phẩm
                </label>
                <input
                  type="text"
                  placeholder="SP-01..."
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tên sản phẩm / Chi tiết gia công <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Áo sơ mi, Bo mạch..."
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Đơn vị tính
                </label>
                <input
                  type="text"
                  placeholder="Cái, Bộ, Thùng..."
                  value={newUnit}
                  onChange={e => setNewUnit(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Đơn giá hoàn thành (VNĐ) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="1000"
                    min="1000"
                    required
                    value={newPrice}
                    onChange={e => setNewPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-blue-700"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Danh mục & Thống kê sản phẩm */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Danh Mục Đơn Giá &amp; Tổng Sản Lượng Hoàn Thành Trong Kỳ
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Mã SP</th>
                    <th className="px-3 py-2.5">Tên Sản Phẩm / Công Đoạn</th>
                    <th className="px-3 py-2.5 text-center">ĐVT</th>
                    <th className="px-3 py-2.5 text-right">Đơn Giá</th>
                    <th className="px-3 py-2.5 text-center bg-blue-50/50 text-blue-800">
                      Tổng Sản Lượng Đã Làm
                    </th>
                    <th className="px-3 py-2.5 text-right bg-emerald-50/50 text-emerald-800">
                      Tổng Tiền Lương SP
                    </th>
                    <th className="px-3 py-2.5 text-center w-12">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productStats.map(prod => (
                    <tr key={prod.id} className="hover:bg-slate-50/60">
                      <td className="px-3 py-2 font-mono text-slate-600">{prod.code}</td>
                      <td className="px-3 py-2 font-medium text-slate-800">{prod.name}</td>
                      <td className="px-3 py-2 text-center text-slate-500">{prod.unit}</td>
                      <td className="px-3 py-2 text-right font-semibold text-slate-900">
                        {formatVND(prod.unitPrice)}
                      </td>
                      <td className="px-3 py-2 text-center font-bold text-blue-700 bg-blue-50/30">
                        {formatNumber(prod.totalQty)} {prod.unit}
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-emerald-700 bg-emerald-50/30">
                        {formatVND(prod.totalMoney)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={4} className="px-3 py-2 text-right text-slate-600">
                      Tổng Cộng Toàn Xưởng:
                    </td>
                    <td className="px-3 py-2 text-center text-blue-700">
                      {formatNumber(productStats.reduce((s, p) => s + p.totalQty, 0))} sản phẩm
                    </td>
                    <td className="px-3 py-2 text-right text-emerald-700">
                      {formatVND(productStats.reduce((s, p) => s + p.totalMoney, 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
