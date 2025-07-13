import { useEffect, useState } from 'react';
import ChatBox from './ChatBox';

function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [showGreeting, setShowGreeting] = useState(false);

    // Hiện lời chào sau 2s
    useEffect(() => {
        const timer = setTimeout(() => setShowGreeting(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end space-y-2">
            {/* Nếu KHÔNG mở thì chỉ hiện lời chào + icon */}
            {!open && (
                <>
                    {showGreeting && (
                        <div
                            onClick={() => setOpen(true)}
                            className="bg-primary text-white text-sm px-4 py-2 rounded-full cursor-pointer shadow-lg animate-bounce hover:brightness-110 transition"
                        >
                            🥪 Xin chào! Hôm nay bạn muốn ăn gì?
                        </div>
                    )}

                    <button
                        onClick={() => setOpen(true)}
                        className="bg-primary text-white p-3 rounded-full shadow-md hover:bg-primary/90 transition"
                    >
                        <i className="ri-customer-service-2-line ri-lg"></i>
                    </button>
                </>
            )}

            {/* Khi mở mới hiện khung chat */}
            {open && (
                <div className="w-80 max-w-[90vw] max-h-[90vh] bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200 flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-center bg-primary text-white px-4 py-2 text-sm">
                        <span>🤖 Trợ lý món ăn</span>
                        <button onClick={() => setOpen(false)} className="hover:opacity-80 transition">
                            Đóng
                        </button>
                    </div>

                    {/* Nội dung chat */}
                    <div className="flex-1 overflow-y-auto p-2">
                        <ChatBox />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatWidget;
