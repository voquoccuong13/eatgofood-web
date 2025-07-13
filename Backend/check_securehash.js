const crypto = require('crypto');
const qs = require('qs');

const VNP_HASHSECRET = 'JE00T8ATPV6TOM3PEL89VG5DPHIL9H66'; // Thay bằng giá trị từ .env
const vnp_Params = {
    vnp_Amount: 89200000,
    vnp_Command: 'pay',
    vnp_CreateDate: '20250708175354',
    vnp_CurrCode: 'VND',
    vnp_ExpireDate: '20250708180854',
    vnp_ExtraData:
        'eyJ1c2VySWQiOiI2ODJkZmE4NjE2YTVmYTFlNGQxNzAyZWYiLCJvcmRlckNvZGUiOiJza0tqMnBfZCIsImZ1bGxOYW1lIjoiY8aw4budbmciLCJlbWFpbCI6InZvcXVvY3Vjb25nMTMwNjAyQGdtYWlsLmNvbSIsInBob25lIjoiMDM3NzUxMzY1MSIsImFkZHJlc3MiOiI5LCBuZ8O0IGNow60gcXXhu5FjIHRhbSBiw6xuaCIsImRpc3RhbmNlIjowLjUyLCJ0b3RhbCI6ODkyMDAwLCJzdWJ0b3RhbCI6ODc3MDAwLCJzaGlwcGluZ0ZlZSI6MTUwMDAsImRpc2NvdW50QW1vdW50IjowLCJuZWVkUGxhc3RpY1V0ZW5zaWxzIjpmYWxzZX0=',
    vnp_IpAddr: '127.0.0.1',
    vnp_Locale: 'vn',
    vnp_OrderInfo: 'Thanh toan don hang skKj2p_d',
    vnp_OrderType: 'other',
    vnp_Returnurl: 'http://localhost:5173/vnpay_return',
    vnp_TmnCode: 'ONPO7IZL',
    vnp_TxnRef: 'skKj2p_d',
    vnp_Version: '2.1.0',
};

const sortedParams = Object.fromEntries(Object.entries(vnp_Params).sort());
const signData = qs.stringify(sortedParams, { encode: false });
const secureHash = crypto.createHmac('sha512', VNP_HASHSECRET).update(Buffer.from(signData, 'utf-8')).digest('hex');

console.log('signData:', signData);
console.log('secureHash:', secureHash);
