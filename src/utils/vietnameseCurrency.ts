/**
 * Chuyển đổi định dạng tiền tệ và đọc số tiền thành chữ tiếng Việt chuẩn kế toán
 */

export function formatVND(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0';
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(amount);
}

const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readGroupOfThree(threeDigits: string, showZeroHundred: boolean): string {
  const [hStr, tStr, uStr] = threeDigits.split('');
  const hundred = parseInt(hStr, 10);
  const ten = parseInt(tStr, 10);
  const unit = parseInt(uStr, 10);

  let result = '';

  if (hundred > 0 || showZeroHundred) {
    result += `${DIGITS[hundred]} trăm `;
    if (ten === 0 && unit > 0) {
      result += 'lẻ ';
    }
  }

  if (ten > 0) {
    if (ten === 1) {
      result += 'mười ';
    } else {
      result += `${DIGITS[ten]} mươi `;
    }
  }

  if (unit > 0) {
    if (ten > 1 && unit === 1) {
      result += 'mốt ';
    } else if (ten > 0 && unit === 5) {
      result += 'lăm ';
    } else if (ten === 0 && hundred > 0 && unit === 5) {
      result += 'năm ';
    } else {
      result += `${DIGITS[unit]} `;
    }
  }

  return result;
}

export function numberToVietnameseWords(num: number): string {
  if (!num || isNaN(num) || num <= 0) {
    return 'Không đồng chẵn';
  }

  const rounded = Math.round(num);
  let str = rounded.toString();

  // Đệm số 0 vào đầu để chia hết cho 3
  while (str.length % 3 !== 0) {
    str = '0' + str;
  }

  const scales = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const groups: string[] = [];

  for (let i = 0; i < str.length; i += 3) {
    groups.push(str.substring(i, i + 3));
  }

  const totalGroups = groups.length;
  let words = '';

  for (let i = 0; i < totalGroups; i++) {
    const group = groups[i];
    const groupVal = parseInt(group, 10);
    const scaleIndex = totalGroups - 1 - i;

    if (groupVal > 0) {
      const showZeroHundred = i > 0;
      const groupWords = readGroupOfThree(group, showZeroHundred);
      words += `${groupWords}${scales[scaleIndex]} `;
    }
  }

  words = words.trim();
  if (!words) {
    return 'Không đồng chẵn';
  }

  // Viết hoa chữ cái đầu và thêm đuôi "đồng chẵn"
  const formatted = words.charAt(0).toUpperCase() + words.slice(1) + ' đồng chẵn';
  return formatted.replace(/\s+/g, ' ');
}
