import { PayrollPeriod, CalculatedPayrollRow } from '../types/payroll';

interface GoogleDriveFile {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

/**
 * Tạo một Google Spreadsheet mới cho kỳ lương
 */
export async function createPayrollSpreadsheet(
  accessToken: string,
  period: PayrollPeriod,
  calculatedRows: CalculatedPayrollRow[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const title = `Bảng Lương Tháng ${period.month}/${period.year} - ${period.companyName || 'Công Ty'}`;

  // 1. Tạo spreadsheet rỗng với 3 sheets
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        { properties: { title: 'Bảng Lương Tổng Hợp' } },
        { properties: { title: 'Lương Sản Phẩm Chi Tiết' } },
        { properties: { title: 'BHXH & Thuế TNCN' } },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Không thể tạo Google Spreadsheet (Mã lỗi ${createRes.status})`
    );
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl =
    sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Điền dữ liệu vào các sheet
  await populateSpreadsheetData(accessToken, spreadsheetId, period, calculatedRows);

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Cập nhật dữ liệu vào Google Spreadsheet có sẵn
 */
export async function syncPayrollToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  period: PayrollPeriod,
  calculatedRows: CalculatedPayrollRow[]
): Promise<void> {
  // Lấy danh sách tab sheet hiện tại để đảm bảo các sheet cần thiết tồn tại
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!metaRes.ok) {
    const err = await metaRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Không tìm thấy bảng tính Google Sheet ID: ${spreadsheetId}`);
  }

  const metaData = await metaRes.json();
  const existingSheetTitles = (metaData.sheets || []).map(
    (s: { properties: { title: string } }) => s.properties.title
  );

  const neededSheets = ['Bảng Lương Tổng Hợp', 'Lương Sản Phẩm Chi Tiết', 'BHXH & Thuế TNCN'];
  const sheetsToAdd = neededSheets.filter(t => !existingSheetTitles.includes(t));

  if (sheetsToAdd.length > 0) {
    const requests = sheetsToAdd.map(title => ({
      addSheet: { properties: { title } },
    }));

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });
  }

  await populateSpreadsheetData(accessToken, spreadsheetId, period, calculatedRows);
}

/**
 * Điền nội dung bảng lương và định dạng dữ liệu vào Spreadsheet
 */
async function populateSpreadsheetData(
  accessToken: string,
  spreadsheetId: string,
  period: PayrollPeriod,
  rows: CalculatedPayrollRow[]
) {
  // --- Sheet 1: Bảng Lương Tổng Hợp ---
  const sheet1Values: (string | number)[][] = [
    [`BẢNG LƯƠNG NHÂN VIÊN THÁNG ${period.month}/${period.year}`],
    [`Đơn vị / Doanh nghiệp: ${period.companyName || 'Công Ty'} - MST: ${period.taxCode || 'N/A'}`],
    [`Ngày công chuẩn tháng: ${period.standardWorkDays} ngày - Ngày xuất bảng lương: ${new Date().toLocaleDateString('vi-VN')}`],
    [],
    [
      'STT',
      'Mã NV',
      'Họ và tên',
      'Phòng ban',
      'Chức vụ',
      'Lương HĐLĐ (VNĐ)',
      'Lương đóng BHXH (VNĐ)',
      'Ngày công',
      'Lương ngày công (VNĐ)',
      'Lương sản phẩm (VNĐ)',
      'Lương OT làm thêm (VNĐ)',
      'Phụ cấp hỗ trợ (VNĐ)',
      'Thưởng (VNĐ)',
      'TỔNG THU NHẬP GROSS (VNĐ)',
      'Trừ BHXH/BHYT/BHTN (10.5%)',
      'Thuế TNCN (VNĐ)',
      'Tạm ứng / Trừ khác (VNĐ)',
      'THỰC LĨNH NET (VNĐ)',
      'Chữ ký nhận',
      'Số tài khoản',
      'Ngân hàng',
    ],
  ];

  rows.forEach((r, idx) => {
    sheet1Values.push([
      idx + 1,
      r.employee.code,
      r.employee.fullName,
      r.employee.department,
      r.employee.position,
      r.employee.contractSalary,
      r.employee.hasInsurance ? r.insuranceBase : 0,
      r.employee.actualWorkDays,
      r.workdaySalary,
      r.pieceworkSalary,
      r.totalOvertimeSalary,
      r.totalAllowances,
      r.bonus,
      r.totalGrossIncome,
      r.totalEmployeeInsurance,
      r.pitTax,
      r.advancePayment + r.otherDeductions,
      r.netSalary,
      '',
      r.employee.bankAccount || '',
      r.employee.bankName || '',
    ]);
  });

  // Dòng Tổng Cộng
  const totalGross = rows.reduce((s, r) => s + r.totalGrossIncome, 0);
  const totalNet = rows.reduce((s, r) => s + r.netSalary, 0);
  const totalIns = rows.reduce((s, r) => s + r.totalEmployeeInsurance, 0);
  const totalPit = rows.reduce((s, r) => s + r.pitTax, 0);
  const totalPiece = rows.reduce((s, r) => s + r.pieceworkSalary, 0);
  const totalAllow = rows.reduce((s, r) => s + r.totalAllowances, 0);
  const totalOt = rows.reduce((s, r) => s + r.totalOvertimeSalary, 0);
  const totalAdv = rows.reduce((s, r) => s + r.advancePayment + r.otherDeductions, 0);

  sheet1Values.push([
    'TỔNG CỘNG',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    totalPiece,
    totalOt,
    totalAllow,
    '',
    totalGross,
    totalIns,
    totalPit,
    totalAdv,
    totalNet,
    '',
    '',
    '',
  ]);

  // --- Sheet 2: Lương Sản Phẩm Chi Tiết ---
  const sheet2Values: (string | number)[][] = [
    [`BẢNG CHI TIẾT LƯƠNG SẢN PHẨM / NĂNG SUẤT THÁNG ${period.month}/${period.year}`],
    [],
    [
      'STT',
      'Mã NV',
      'Họ và tên',
      'Mã sản phẩm',
      'Tên sản phẩm / Công đoạn',
      'Đơn vị tính',
      'Đơn giá (VNĐ)',
      'Số lượng hoàn thành',
      'Thành tiền (VNĐ)',
    ],
  ];

  let pIndex = 1;
  rows.forEach(r => {
    if (r.employee.pieceworkItems && r.employee.pieceworkItems.length > 0) {
      r.employee.pieceworkItems.forEach(item => {
        sheet2Values.push([
          pIndex++,
          r.employee.code,
          r.employee.fullName,
          item.productId,
          item.productName,
          item.unit,
          item.unitPrice,
          item.quantity,
          item.quantity * item.unitPrice,
        ]);
      });
    } else {
      sheet2Values.push([
        pIndex++,
        r.employee.code,
        r.employee.fullName,
        '-',
        '(Không phát sinh)',
        '-',
        0,
        0,
        0,
      ]);
    }
  });

  // --- Sheet 3: BHXH & Thuế TNCN ---
  const sheet3Values: (string | number)[][] = [
    [`BẢNG THEO DÕI TRÍCH ĐÓNG BẢO HIỂM & THUẾ TNCN THÁNG ${period.month}/${period.year}`],
    [
      'Lưu ý: Các khoản trợ cấp (ăn trưa, xăng xe, điện thoại, nhà ở, con nhỏ) KHÔNG tính đóng BHXH.',
    ],
    [],
    [
      'STT',
      'Mã NV',
      'Họ và tên',
      'Lương HĐLĐ (VNĐ)',
      'Lương Đóng BHXH (VNĐ)',
      'BHXH NLĐ (8%)',
      'BHYT NLĐ (1.5%)',
      'BHTN NLĐ (1%)',
      'Tổng NLĐ Đóng (10.5%)',
      'BHXH DN (17.5%)',
      'BHYT DN (3%)',
      'BHTN DN (1%)',
      'KPCĐ DN (2%)',
      'Tổng DN Đóng (23.5%)',
      'Số Người Phụ Thuộc',
      'Giảm Trừ Bản Thân',
      'Giảm Trừ Phụ Thuộc',
      'Thu Nhập Tính Thuế TNTT',
      'Thuế TNCN Phải Nộp',
    ],
  ];

  rows.forEach((r, idx) => {
    sheet3Values.push([
      idx + 1,
      r.employee.code,
      r.employee.fullName,
      r.employee.contractSalary,
      r.employee.hasInsurance ? r.insuranceBase : 0,
      r.employeeBhxh,
      r.employeeBhyt,
      r.employeeBhtn,
      r.totalEmployeeInsurance,
      r.employerBhxh,
      r.employerBhyt,
      r.employerBhtn,
      r.employerUnion,
      r.totalEmployerInsurance,
      r.employee.dependentsCount || 0,
      r.personalDeduction,
      r.dependentDeduction,
      r.assessableIncome,
      r.pitTax,
    ]);
  });

  // Gửi batchUpdate cập nhật dữ liệu cả 3 sheet
  const updateBody = {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: "'Bảng Lương Tổng Hợp'!A1",
        values: sheet1Values,
      },
      {
        range: "'Lương Sản Phẩm Chi Tiết'!A1",
        values: sheet2Values,
      },
      {
        range: "'BHXH & Thuế TNCN'!A1",
        values: sheet3Values,
      },
    ],
  };

  const putRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    }
  );

  if (!putRes.ok) {
    const errorData = await putRes.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Lỗi cập nhật số liệu lên Google Sheet (Mã lỗi ${putRes.status})`
    );
  }
}

/**
 * Tìm các Google Sheet liên quan trong Google Drive
 */
export async function listUserPayrollSheets(accessToken: string): Promise<GoogleDriveFile[]> {
  try {
    const query = encodeURIComponent(
      "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false"
    );
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime desc&pageSize=15&fields=files(id,name,modifiedTime,webViewLink)`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('Error listing Google Drive files:', err);
    return [];
  }
}
