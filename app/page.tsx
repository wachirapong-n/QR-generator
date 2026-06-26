"use client";

import { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import QRCode from "qrcode";

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const onDrop = useCallback(
    (acceptedFiles: File[], _rejected: FileRejection[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const fileName = file.name;
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const content = e.target?.result;
          if (
            typeof content === "string" &&
            content.trim().startsWith("http")
          ) {
            setUrl(content.trim().split("\n")[0]);
          } else {
            setUrl(fileName);
          }
        };
        reader.onerror = () => setUrl(fileName);
        reader.readAsText(file);
      }
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const handleGenerate = async (): Promise<void> => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("กรุณากรอก URL หรืออัปโหลดไฟล์ก่อน");
      return;
    }
    setError("");
    setIsGenerating(true);
    try {
      const dataUrl = await QRCode.toDataURL(trimmed, {
        width: 400,
        margin: 2,
        color: { dark: "#1a1a2e", light: "#ffffff" },
        errorCorrectionLevel: "H",
      });
      setQrDataUrl(dataUrl);
    } catch {
      setError("ไม่สามารถสร้าง QR Code ได้ กรุณาลองใหม่");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (): void => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "qrcode.png";
    link.click();
  };

  const handleClear = (): void => {
    setUrl("");
    setQrDataUrl(null);
    setError("");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-4 py-8 sm:py-12 font-sans">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <span className="text-3xl sm:text-4xl block mb-2">⬡</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1">
            QR Generator
          </h1>
          <p className="text-xs sm:text-sm text-white/50">
            แปลง URL หรือข้อความให้เป็น QR Code
          </p>
        </div>

        {/* URL Input */}
        <div className="mb-4 sm:mb-5">
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-2">
            URL หรือข้อความ
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUrl(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                e.key === "Enter" && handleGenerate()
              }
              placeholder="https://example.com"
              className="flex-1 min-w-0 bg-white/8 border border-white/15 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white text-sm placeholder-white/30 outline-none focus:border-violet-400 transition-colors"
            />
            {url && (
              <button
                onClick={handleClear}
                className="w-9 h-9 flex items-center justify-center bg-white/10 text-white/60 rounded-lg hover:bg-white/20 transition-colors text-sm shrink-0"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5 sm:my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/40 whitespace-nowrap">
            หรืออัปโหลดไฟล์
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-5 sm:p-7 text-center cursor-pointer transition-all mb-5 sm:mb-6 ${
            isDragActive
              ? "border-violet-400 bg-violet-500/10"
              : "border-white/20 bg-white/3 hover:border-white/40 hover:bg-white/5"
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-2xl sm:text-3xl mb-2">
            {isDragActive ? "📂" : "📁"}
          </div>
          <p className="text-white/70 text-xs sm:text-sm mb-1">
            {isDragActive
              ? "วางไฟล์ที่นี่..."
              : "ลากไฟล์มาวาง หรือคลิกเพื่อเลือก"}
          </p>
          <p className="text-white/30 text-xs">รองรับทุกประเภทไฟล์</p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-xs sm:text-sm text-center mb-3">
            {error}
          </p>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-white font-semibold text-sm sm:text-base tracking-wide transition-all ${
            isGenerating
              ? "bg-violet-500/50 cursor-not-allowed"
              : "bg-linear-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 active:scale-[0.98]"
          }`}
        >
          {isGenerating ? "กำลังสร้าง..." : "สร้าง QR Code"}
        </button>

        {/* QR Result */}
        {qrDataUrl && (
          <div className="mt-6 sm:mt-8 flex flex-col items-center gap-3">
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xl">
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="w-36 h-36 sm:w-48 sm:h-48 block"
              />
            </div>
            <p className="text-white/40 text-xs">สแกนด้วยกล้องมือถือ</p>
            <button
              onClick={handleDownload}
              className="w-full sm:w-auto px-7 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              ⬇ ดาวน์โหลด PNG
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
