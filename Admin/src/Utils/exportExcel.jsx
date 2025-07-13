import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcelWithExcelJS = async (monthlyData, topProducts = []) => {
    try {
        const workbook = new ExcelJS.Workbook();

        // ===== Sheet 1: Doanh thu =====
        const revenueSheet = workbook.addWorksheet('Doanh thu');

        revenueSheet.mergeCells('A1', 'D1');
        const titleCell = revenueSheet.getCell('A1');
        titleCell.value = 'BÁO CÁO DOANH THU NĂM 2025';
        titleCell.font = { size: 14, bold: true };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        titleCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD700' },
        };

        revenueSheet.addRow(['Tháng', 'Doanh thu (VND)', 'Số đơn hàng', 'Giá trị đơn TB (VND)']);
        revenueSheet.columns = [
            { key: 'month', width: 20 },
            { key: 'total', width: 20 },
            { key: 'orders', width: 20 },
            { key: 'avgOrder', width: 25 },
        ];

        let totalRevenue = 0;
        let totalOrders = 0;

        monthlyData.forEach((item) => {
            const avgOrder = item.orders > 0 ? Math.round(item.total / item.orders) : 0;
            revenueSheet.addRow({
                month: formatMonth(item.month),
                total: item.total,
                orders: item.orders,
                avgOrder,
            });
            totalRevenue += item.total;
            totalOrders += item.orders;
        });

        const totalRow = revenueSheet.addRow({
            month: 'Tổng cộng',
            total: totalRevenue,
            orders: totalOrders,
            avgOrder: '',
        });
        totalRow.font = { bold: true };

        revenueSheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
                if (rowNumber === 2) {
                    cell.font = { bold: true };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'ADD8E6' },
                    };
                    cell.alignment = { horizontal: 'center' };
                }
                if (['total', 'avgOrder'].includes(cell._column.key)) {
                    cell.numFmt = '#,##0"₫"';
                }
            });
        });

        // ===== Sheet 2: Top sản phẩm =====
        const productSheet = workbook.addWorksheet('Top sản phẩm');

        productSheet.mergeCells('A1', 'E1');
        const productTitle = productSheet.getCell('A1');
        productTitle.value = 'TOP 5 SẢN PHẨM BÁN CHẠY';
        productTitle.font = { size: 14, bold: true };
        productTitle.alignment = { vertical: 'middle', horizontal: 'center' };
        productTitle.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFA07A' },
        };

        productSheet.addRow(['STT', 'Tên sản phẩm', 'Số lượng bán', 'Giá bán (VND)', 'Tổng tiền (VND)']);
        productSheet.columns = [
            { key: 'index', width: 8 },
            { key: 'name', width: 30 },
            { key: 'quantity', width: 18 },
            { key: 'price', width: 18 },
            { key: 'totalValue', width: 22 },
        ];

        let totalQty = 0;
        let totalMoney = 0;

        topProducts.slice(0, 5).forEach((item, index) => {
            const total = item.totalQuantity * item.price;
            productSheet.addRow({
                index: index + 1,
                name: item.name,
                quantity: item.totalQuantity,
                price: item.price,
                totalValue: total,
            });
            totalQty += item.totalQuantity;
            totalMoney += total;
        });

        const totalProductRow = productSheet.addRow({
            index: '',
            name: 'Tổng cộng',
            quantity: totalQty,
            price: '',
            totalValue: totalMoney,
        });
        totalProductRow.font = { bold: true };

        productSheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
                if (rowNumber === 2) {
                    cell.font = { bold: true };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFDAB9' },
                    };
                    cell.alignment = { horizontal: 'center' };
                }
                if (['price', 'totalValue'].includes(cell._column.key)) {
                    cell.numFmt = '#,##0"₫"';
                }
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, 'BaoCaoDoanhThu_2025.xlsx');
    } catch (error) {
        console.error(' Lỗi export bằng ExcelJS:', error);
        alert('Xuất báo cáo thất bại.');
    }
};

//  Format tháng
const formatMonth = (monthStr) => {
    if (!monthStr) return 'N/A';
    const [year, month] = monthStr.split('-');
    const monthNames = [
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12',
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
};
