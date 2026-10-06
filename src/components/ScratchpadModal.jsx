import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  X,
  PenTool,
  Trash2,
  Type,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Columns,
  Minimize2,
  Eye,
  EyeOff,
  Bookmark,
  BookmarkCheck,
  Eraser,
} from 'lucide-react';
import MathRenderer from './MathRenderer';

export default function ScratchpadModal({
  isOpen,
  onClose,
  currentQuestion,
  currentQuestionIndex = 0,
  totalQuestions = 0,
  onNextQuestion,
  onPrevQuestion,
  onSelectOption,
  selectedOption,
  isFlagged = false,
  onToggleFlag,
}) {
  const canvasRef = useRef(null);
  const savedCanvasDataRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#f59e0b'); // Amber/Gold default
  const [lineWidth, setLineWidth] = useState(2);
  const [isEraser, setIsEraser] = useState(false);
  const [mode, setMode] = useState('canvas'); // 'canvas' | 'text'
  const [notes, setNotes] = useState('');

  // View state: 'docked' (default right panel), 'center' (modal), 'minimized' (floating pill)
  const [viewMode, setViewMode] = useState('docked');
  // Collapsible question preview card inside scratchpad
  const [showQuestionCard, setShowQuestionCard] = useState(true);

  // Save current canvas content to in-memory ref
  const saveCanvasData = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;
    try {
      savedCanvasDataRef.current = canvas.toDataURL();
    } catch {
      // In case of any cross-origin/taint issue, safely ignore
    }
  }, []);

  // Restore saved canvas content
  const restoreCanvasData = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !savedCanvasDataRef.current) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
    img.src = savedCanvasDataRef.current;
  }, []);

  // Handle canvas sizing & resize preservation
  useEffect(() => {
    if (!isOpen || viewMode === 'minimized' || mode !== 'canvas') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width <= 0 || height <= 0) continue;

        // If canvas already has content, save it before resize
        let tempCanvas = null;
        if (canvas.width > 0 && canvas.height > 0) {
          tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx.drawImage(canvas, 0, 0);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (tempCanvas) {
          ctx.drawImage(tempCanvas, 0, 0);
        } else if (savedCanvasDataRef.current) {
          restoreCanvasData();
        }
      }
    });

    const parent = canvas.parentElement;
    if (parent) {
      resizeObserver.observe(parent);
    }

    return () => {
      saveCanvasData();
      resizeObserver.disconnect();
    };
  }, [isOpen, viewMode, mode, restoreCanvasData, saveCanvasData]);

  if (!isOpen) return null;

  // Floating Minimized Pill
  if (viewMode === 'minimized') {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#161824] border border-amber-500/50 rounded-2xl px-4 py-2.5 shadow-2xl animate-fade-in hover:border-amber-400 transition group">
        <button
          onClick={() => setViewMode('docked')}
          className="flex items-center gap-2 text-left"
          title="Click to expand Scratchpad"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          <div>
            <div className="text-xs font-bold text-amber-300 group-hover:text-amber-200 flex items-center gap-1.5">
              <span>Scratchpad Active</span>
              <span className="text-[10px] font-mono text-gray-400">
                (Q{currentQuestionIndex + 1}/{totalQuestions})
              </span>
            </div>
            <p className="text-[10px] text-gray-400">Click to expand docked drawer</p>
          </div>
        </button>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-300 rounded hover:bg-white/10 transition ml-1"
          title="Close Scratchpad"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoords(e);

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = lineWidth * 3;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }

    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoords(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveCanvasData();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    savedCanvasDataRef.current = null;
  };

  // Header & Content layout classes
  const isDocked = viewMode === 'docked';

  const containerClasses = isDocked
    ? 'fixed top-0 right-0 bottom-0 z-40 w-full sm:w-[500px] md:w-[560px] lg:w-[620px] bg-[#141620] border-l border-amber-500/30 shadow-2xl flex flex-col animate-slide-left'
    : 'bg-[#14161f] border border-amber-500/30 rounded-2xl w-full max-w-4xl h-[720px] flex flex-col shadow-2xl overflow-hidden';

  const wrapperClasses = isDocked
    ? 'fixed inset-0 pointer-events-none z-40' // Non-blocking wrapper, allows left-side clicks
    : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in';

  return (
    <div className={wrapperClasses}>
      <div className={`${containerClasses} pointer-events-auto`}>
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#181a26] gap-2">
          {/* Left: Scratchpad Title & Question Navigator */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0"></span>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-white tracking-wide">
                  Virtual Scratchpad
                </span>
                <span className="text-[10px] bg-red-950/80 text-red-300 px-1.5 py-0.2 rounded border border-red-800/40 hidden sm:inline">
                  No Calculator
                </span>
              </div>
            </div>

            {/* In-Pad Question Switcher */}
            <div className="flex items-center bg-[#10121a] border border-gray-800 rounded-lg p-0.5 ml-1">
              <button
                onClick={onPrevQuestion}
                disabled={currentQuestionIndex <= 0}
                className="p-1 rounded text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition"
                title="Previous Question"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold text-amber-400 px-1.5 whitespace-nowrap">
                Q{currentQuestionIndex + 1}/{totalQuestions}
              </span>
              <button
                onClick={onNextQuestion}
                disabled={currentQuestionIndex >= totalQuestions - 1}
                className="p-1 rounded text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition"
                title="Next Question"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Mode switches and Window Controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Question Card Visibility Toggle */}
            <button
              onClick={() => setShowQuestionCard((prev) => !prev)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
                showQuestionCard
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-[#10121a] text-gray-400 border-gray-800 hover:text-white'
              }`}
              title={showQuestionCard ? 'Hide Question Stem' : 'Show Question Stem'}
            >
              {showQuestionCard ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-semibold hidden md:inline">
                {showQuestionCard ? 'Hide Q' : 'Show Q'}
              </span>
            </button>

            {/* Drawing vs Text Mode */}
            <div className="flex bg-[#10121a] p-0.5 rounded-lg border border-gray-800">
              <button
                onClick={() => setMode('canvas')}
                className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition ${
                  mode === 'canvas' ? 'bg-amber-500 text-black shadow' : 'text-gray-400 hover:text-white'
                }`}
                title="Canvas Drawing Mode"
              >
                <PenTool className="w-3 h-3" />
                <span className="text-[10px] hidden sm:inline">Draw</span>
              </button>
              <button
                onClick={() => setMode('text')}
                className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition ${
                  mode === 'text' ? 'bg-amber-500 text-black shadow' : 'text-gray-400 hover:text-white'
                }`}
                title="Text Notes Mode"
              >
                <Type className="w-3 h-3" />
                <span className="text-[10px] hidden sm:inline">Notes</span>
              </button>
            </div>

            {/* Dock / Center / Minimize layout toggles */}
            <button
              onClick={() => setViewMode(isDocked ? 'center' : 'docked')}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              title={isDocked ? 'Expand to Centered Modal' : 'Dock to Right Panel'}
            >
              {isDocked ? <Maximize2 className="w-4 h-4" /> : <Columns className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setViewMode('minimized')}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              title="Minimize Scratchpad to corner"
            >
              <Minimize2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                saveCanvasData();
                onClose();
              }}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition ml-0.5"
              title="Close Scratchpad"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Active Question Preview Banner */}
        {showQuestionCard && currentQuestion && (
          <div className="bg-[#10121a] border-b border-gray-800 p-3.5 max-h-52 overflow-y-auto space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Question {currentQuestionIndex + 1}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-[11px] text-gray-300">{currentQuestion.topic}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    currentQuestion.difficulty === 'EASY'
                      ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40'
                      : currentQuestion.difficulty === 'MEDIUM'
                        ? 'bg-amber-950/70 text-amber-400 border border-amber-800/40'
                        : 'bg-red-950/70 text-red-400 border border-red-800/40'
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
              </div>

              {onToggleFlag && (
                <button
                  onClick={onToggleFlag}
                  className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded transition ${
                    isFlagged
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                      : 'text-gray-400 hover:text-gray-200 bg-[#1c1f2e]'
                  }`}
                  title="Flag Question"
                >
                  {isFlagged ? (
                    <>
                      <BookmarkCheck className="w-3 h-3 text-amber-400" />
                      <span>Flagged</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3 h-3" />
                      <span>Flag</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Stimulus if applicable */}
            {currentQuestion.stimulus && (
              <div className="p-2 rounded bg-[#0b0d13] border border-gray-800 text-gray-400 text-xs italic leading-relaxed">
                {currentQuestion.stimulus}
              </div>
            )}

            {/* Question prompt with MathJax/KaTeX */}
            <div className="text-white text-xs sm:text-sm font-medium leading-relaxed">
              <MathRenderer content={currentQuestion.question} />
            </div>

            {/* Clickable Quick Option Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onSelectOption?.(opt.id)}
                    className={`text-left p-2 rounded-lg border text-xs flex items-center gap-2 transition ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-200 ring-1 ring-amber-500/40'
                        : 'bg-[#161824] border-gray-800 text-gray-300 hover:bg-[#1e2130]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${
                        isSelected
                          ? 'bg-amber-500 text-black'
                          : 'bg-[#0f1118] text-gray-400 border border-gray-700'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className="truncate">
                      <MathRenderer content={opt.text} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Scratchpad Main Workspace */}
        <div className="flex-1 relative bg-[#0e1017] overflow-hidden flex flex-col">
          {mode === 'canvas' ? (
            <>
              {/* Drawing Toolbar */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-[#1b1e2b]/95 backdrop-blur border border-gray-700/60 p-1.5 rounded-xl shadow-xl flex-wrap">
                {/* Pen / Eraser Mode */}
                <div className="flex bg-[#10121a] p-0.5 rounded-lg border border-gray-800">
                  <button
                    onClick={() => setIsEraser(false)}
                    className={`p-1.5 rounded transition ${
                      !isEraser ? 'bg-amber-500 text-black shadow' : 'text-gray-400 hover:text-white'
                    }`}
                    title="Pen tool"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsEraser(true)}
                    className={`p-1.5 rounded transition ${
                      isEraser ? 'bg-amber-500 text-black shadow' : 'text-gray-400 hover:text-white'
                    }`}
                    title="Eraser tool"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Color Palette */}
                {!isEraser && (
                  <div className="flex items-center gap-1 border-l border-gray-700 pl-2">
                    {['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#ffffff'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-4 h-4 rounded-full border transition ${
                          color === c ? 'scale-125 border-white ring-2 ring-amber-400/50' : 'border-transparent opacity-80'
                        }`}
                        style={{ backgroundColor: c }}
                        title={`Color ${c}`}
                      />
                    ))}
                  </div>
                )}

                {/* Stroke Thickness */}
                <div className="flex items-center gap-1 border-l border-gray-700 pl-2">
                  {[2, 4, 8].map((size) => (
                    <button
                      key={size}
                      onClick={() => setLineWidth(size)}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition ${
                        lineWidth === size
                          ? 'bg-amber-500/20 text-amber-300 font-bold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {size}px
                    </button>
                  ))}
                </div>

                {/* Clear Canvas */}
                <div className="border-l border-gray-700 pl-2">
                  <button
                    onClick={clearCanvas}
                    className="px-2 py-1 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded flex items-center gap-1 transition"
                    title="Clear entire canvas"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Radial dot grid background & Canvas */}
              <div
                className="w-full h-full relative"
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
              placeholder="Type your algebraic steps, arithmetic, scratch equations, or reminders here..."
              className="w-full h-full p-5 bg-transparent text-gray-200 placeholder-gray-600 font-mono text-xs sm:text-sm focus:outline-none resize-none leading-relaxed"
            />
          )}
        </div>

        {/* Modal / Drawer Footer */}
        <div className="px-4 py-2.5 bg-[#141620] border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400">
              {isDocked ? 'Side-docked view active' : 'Centered view active'} • Drawings persist
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                saveCanvasData();
                onClose();
              }}
              className="px-3.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
