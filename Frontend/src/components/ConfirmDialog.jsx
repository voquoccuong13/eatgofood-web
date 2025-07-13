import React from "react";
import { CheckCircle, AlertTriangle } from "lucide-react"; // hoặc dùng heroicons nếu bạn thích

const ConfirmDialog = ({
  title = "Xác nhận hành động",
  message,
  onConfirm,
  onCancel,
  icon = "warning", // 'warning' | 'success' | 'none'
  confirmColor = "red",
}) => {
  const renderIcon = () => {
    if (icon === "success") {
      return <CheckCircle className="text-green-500 w-6 h-6" />;
    } else if (icon === "warning") {
      return <AlertTriangle className="text-yellow-500 w-6 h-6" />;
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
        <div className="flex items-center gap-2 mb-4">
          {renderIcon()}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p>{message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded bg-${confirmColor}-600 text-white bg-primary hover:bg-${confirmColor}-700 text-sm`}
          >
            Xác nhận
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
