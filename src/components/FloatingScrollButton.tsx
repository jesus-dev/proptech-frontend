"use client";

const FloatingScrollButton = () => {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-[9999] bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
      style={{ position: 'fixed' }}
    >
      ↑
    </button>
  );
};

export default FloatingScrollButton;
