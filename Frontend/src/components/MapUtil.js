// Hàm tính khoảng cách Haversine
export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Tính tổng phụ từ cartItem
export function getSubtotal(cartItem) {
    if (!cartItem) return 0;
    return Object.values(cartItem).reduce((total, item) => total + item.price * item.quantity, 0);
}

// Tính giảm giá theo mã
export function getDiscountAmount(subtotal, discountRate) {
    return subtotal * discountRate;
}

// Tính phí vận chuyển (dựa vào khoảng cách hoặc loại)
const shippingRates = [
    { maxDistance: 2, fee: 15000 },
    { maxDistance: 5, fee: 20000 },
    // { maxDistance: Infinity, fee: 20000 },
];

export function calculateShippingFee(distanceKm) {
    if (distanceKm == null) return 0;
    for (const rate of shippingRates) {
        if (distanceKm <= rate.maxDistance) return rate.fee;
    }
    return 20000;
}

// Tính tổng đơn
export function getTotal(subtotal, discountAmount, shippingFee) {
    return subtotal - discountAmount + shippingFee;
}
