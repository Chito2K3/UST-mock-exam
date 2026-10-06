import React, { useRef, useState, useEffect } from 'react';
import { X, Eraser, PenTool, Trash2, Type } from 'lucide-react';

export default function ScratchpadModal({ isOpen, onClose }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#f59e0b'); // Amber/Gold default
  const [lineWidth, setLineWidth] = useState(2);
  const [mode, setMode] = useState('canvas'); // 'canvas' | 'text'
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isOpen || mode !== 'canvas') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // Ensure canvas dimensions match container
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#14161f] border border-amber-500/30 rounded-2xl w-full max-w-3xl h-[600px] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800 bg-[#191b26]">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                USTET Virtual Scratchpad
                <span className="text-[11px] bg-red-950/80 text-red-300 font-normal px-2 py-0.5 rounded border border-red-800/40">
                  Calculators Prohibited
                </span>
              </h3>
              <p className="text-xs text-gray-400">Use this workspace for manual arithmetic, scratch calculations, and equations.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#0f1017] p-1 rounded-lg border border-gray-800">
              <button
                onClick={() => setMode('canvas')}
                className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
                  mode === 'canvas' ? 'bg-amber-500 text-black shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                Drawing
              </button>
              <button
                onClick={() => setMode('text')}
                className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
                  mode === 'text' ? 'bg-amber-500 text-black shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                Text Notes
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              title="Close Scratchpad"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 relative bg-[#0e1017] overflow-hidden">
          {mode === 'canvas' ? (
            <>
              {/* Drawing Toolbar */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-[#1b1e2b]/90 backdrop-blur border border-gray-700/60 p-1.5 rounded-xl shadow-lg">
                <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
                  {['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#ffffff'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-5 h-5 rounded-full border-2 transition ${
                        color === c ? 'scale-110 border-white ring-2 ring-amber-400/50' : 'border-transparent opacity-80'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
                  {[2, 4, 8].map((size) => (
                    <button
                      key={size}
                      onClick={() => setLineWidth(size)}
                      className={`px-2 py-0.5 rounded text-xs transition ${
                        lineWidth === size ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {size}px
                    </button>
                  ))}
                </div>

                <button
                  onClick={clearCanvas}
                  className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded flex items-center gap-1 transition"
                  title="Clear entire canvas"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>

              {/* Grid background for scratch canvas */}
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `radial-gradient(circle, #252a38 1px, transparent 1px)`,
                  backgroundSize: '24px 24px',
                }}
              >
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full cursor-crosshair touch-none"
                />
              </div>
            </>
          ) : (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Type your intermediate calculations, algebra steps, or notes here..."
              className="w-full h-full p-6 bg-transparent text-gray-200 placeholder-gray-600 font-mono text-sm focus:outline-none resize-none"
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 bg-[#141620] border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
          <span>Tip: Scratchpad contents persist while switching between questions in this section.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
