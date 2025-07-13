import React, { useContext } from "react";
import { StoreContext } from "../context/StoreContext";
const AddedNotification = () => {
  const { showAddedNotification } = useContext(StoreContext);

  if (!showAddedNotification) return null;

  return (
    <div className="fixed top-16 right-6 bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 shadow-lg z-50">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span>Đã thêm vào giỏ hàng</span>
    </div>
  );
};

export default AddedNotification;
