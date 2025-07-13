import React, { useState, useEffect } from "react";

const AddToCartModal = ({ visible, onClose, item, onAddToCart }) => {
  // State local
  const [quantity, setQuantity] = useState(1);
  const [spiceLevel, setSpiceLevel] = useState("normal"); // normal, spicy, extraSpicy
  const [sauces, setSauces] = useState({
    mayo: false,
    cheese: false,
    chili: false,
  });

  // Reset trạng thái mỗi lần mở modal mới
  useEffect(() => {
    if (visible) {
      setQuantity(1);
      setSpiceLevel("normal");
      setSauces({ mayo: false, cheese: false, chili: false });
    }
  }, [visible]);

  if (!visible || !item) return null;

  // Giá mỗi loại sốt
  const saucePrices = {
    mayo: 5000,
    cheese: 10000,
    chili: 5000,
  };

  // Tính tổng giá: (giá món * số lượng) + tổng tiền sốt
  const totalPrice =
    quantity * item.price +
    Object.entries(sauces).reduce((sum, [key, checked]) => {
      if (checked) return sum + saucePrices[key] * quantity;
      return sum;
    }, 0);

  // Xử lý toggle checkbox sốt
  const handleSauceChange = (key) => {
    setSauces((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Xử lý tăng/giảm số lượng
  const increaseQty = () => setQuantity((q) => Math.min(q + 1, 99));
  const decreaseQty = () => setQuantity((q) => Math.max(q - 1, 1));

  // Xử lý thêm món vào giỏ
  const handleAddToCart = () => {
    // Gửi dữ liệu về cho component cha
    onAddToCart({
      id: item._id,
      quantity,
      spiceLevel,
      sauces: Object.keys(sauces).filter((k) => sauces[k]),
    });
    onClose();
  };

  return (
    <>
      {/* Background đen mờ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Modal box */}
      <div className="fixed z-50 top-1/2 left-1/2 w-full max-w-md bg-white rounded-lg p-6 shadow-lg -translate-x-1/2 -translate-y-1/2">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">Thêm vào giỏ hàng</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Đóng modal"
          >
            <i className="ri-close-line ri-lg"></i>
          </button>
        </div>

        {/* Hình + tên + giá */}
        <div className="flex items-center gap-4 mb-4">
          <img
            src={item.image}
            alt={item.name}
            className="w-20 h-20 object-cover rounded"
          />
          <div>
            <h4 className="font-bold text-lg">{item.name}</h4>
            <p className="text-primary font-bold">
              {item.price.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </p>
          </div>
        </div>

        {/* Số lượng */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số lượng
          </label>
          <div className="flex items-center max-w-max border border-gray-300 rounded">
            <button
              onClick={decreaseQty}
              className="w-10 h-10 flex items-center justify-center border-r border-gray-300 text-gray-600 hover:bg-gray-100"
              aria-label="Giảm số lượng"
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val)) val = 1;
                else if (val < 1) val = 1;
                else if (val > 99) val = 99;
                setQuantity(val);
              }}
              className="w-16 text-center border-none outline-none"
              min="1"
              max="99"
            />
            <button
              onClick={increaseQty}
              className="w-10 h-10 flex items-center justify-center border-l border-gray-300 text-gray-600 hover:bg-gray-100"
              aria-label="Tăng số lượng"
            >
              +
            </button>
          </div>
        </div>

        {/* Tùy chọn vị cay */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tùy chọn vị cay
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="spice-level"
                value="normal"
                checked={spiceLevel === "normal"}
                onChange={() => setSpiceLevel("normal")}
              />
              Vị thường
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="spice-level"
                value="spicy"
                checked={spiceLevel === "spicy"}
                onChange={() => setSpiceLevel("spicy")}
              />
              Vị cay
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="spice-level"
                value="extraSpicy"
                checked={spiceLevel === "extraSpicy"}
                onChange={() => setSpiceLevel("extraSpicy")}
              />
              Vị cay đặc biệt
            </label>
          </div>
        </div>

        {/* Tùy chọn sốt chấm */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sốt chấm thêm
          </label>
          <div className="space-y-2">
            {["mayo", "cheese", "chili"].map((sauceKey) => (
              <label
                key={sauceKey}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={sauces[sauceKey]}
                  onChange={() => handleSauceChange(sauceKey)}
                />
                {sauceKey === "mayo" && "Sốt mayonnaise (+5.000 ₫)"}
                {sauceKey === "cheese" && "Sốt phô mai (+10.000 ₫)"}
                {sauceKey === "chili" && "Sốt ớt cay (+5.000 ₫)"}
              </label>
            ))}
          </div>
        </div>

        {/* Tổng cộng */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-700 font-medium">Tổng cộng:</span>
          <span className="text-xl font-bold text-primary">
            {totalPrice.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        </div>

        {/* Nút */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="border border-primary text-primary py-2 font-medium rounded whitespace-nowrap hover:bg-primary/5 transition"
          >
            Tiếp tục mua hàng
          </button>
          <button
            onClick={handleAddToCart}
            className="bg-primary text-white py-2 font-medium rounded whitespace-nowrap hover:bg-primary/90 transition"
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </>
  );
};

export default AddToCartModal;
