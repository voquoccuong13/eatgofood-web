import React from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    // Scroll lên đầu trang mỗi khi pathname thay đổi
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
