import React from 'react';
import { ChromePicker } from 'react-color';

function EmojiGenerator({
  text,
  setText,
  color,
  setColor,
  backgroundColor,
  setBackgroundColor,
  showColorPicker,
  setShowColorPicker,
  showBgColorPicker,
  setShowBgColorPicker,
  isBold,
  setIsBold,
  isItalic,
  setIsItalic,
  isStrikethrough,
  setIsStrikethrough,
  selectedFont,
  setSelectedFont,
  textAlign,
  setTextAlign,
  FONTS,
  previewRef,
  textRef,
  containerRef,
  handleDownload,
}) {

  return (
    <div style={{width: '450px', height: '750px'}} className="bg-white shadow-lg rounded-lg p-6 flex flex-col">
      <h2 className="text-2xl font-bold text-center mb-6">이모지 생성기</h2>
      
      {/* Text input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          텍스트
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="텍스트 입력"
          className="w-full p-2 border rounded"
          rows="2"
        />
      </div>

      {/* Font */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          폰트
        </label>
        <select
          value={selectedFont.value}
          onChange={(e) =>
            setSelectedFont(
              FONTS.find((font) => font.value === e.target.value)
            )
          }
          className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
        >
          {FONTS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

      {/* Text style */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          텍스트 스타일
        </label>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsBold(!isBold)}
            className={`px-2 py-1.5 border rounded-md ${isBold ? 'bg-gray-200' : ''}`}
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => setIsItalic(!isItalic)}
            className={`px-2 py-1.5 border rounded-md ${isItalic ? 'bg-gray-200' : ''}`}
          >
            <em>I</em>
          </button>
          <button
            onClick={() => setIsStrikethrough(!isStrikethrough)}
            className={`px-2 py-1.5 border rounded-md ${isStrikethrough ? 'bg-gray-200' : ''}`}
          >
            <span className="line-through">S</span>
          </button>
        </div>
      </div>

      {/* Text alignment */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          텍스트 정렬
        </label>
        <div className="flex space-x-3">
          <button
            onClick={() => setTextAlign('left')}
            className={`flex-1 px-2 py-1.5 border rounded-md ${textAlign === 'left' ? 'bg-gray-200' : ''}`}
          >
            왼쪽
          </button>
          <button
            onClick={() => setTextAlign('center')}
            className={`flex-1 px-2 py-1.5 border rounded-md ${textAlign === 'center' ? 'bg-gray-200' : ''}`}
          >
            가운데
          </button>
          <button
            onClick={() => setTextAlign('right')}
            className={`flex-1 px-2 py-1.5 border rounded-md ${textAlign === 'right' ? 'bg-gray-200' : ''}`}
          >
            오른쪽
          </button>
        </div>
      </div>

      {/* Colors */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          색상
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md flex items-center text-sm"
            >
              <div
                className="w-6 h-6 rounded mr-2"
                style={{ backgroundColor: color }}
              />
              텍스트 색상
            </button>
            {showColorPicker && (
              <div className="absolute z-10 mt-2">
                <ChromePicker
                  color={color}
                  onChange={(color) => setColor(color.hex)}
                />
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowBgColorPicker(!showBgColorPicker)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md flex items-center text-sm"
            >
              <div
                className="w-6 h-6 rounded mr-2"
                style={{ backgroundColor: backgroundColor }}
              />
              배경 색상
            </button>
            {showBgColorPicker && (
              <div className="absolute z-10 mt-2">
                <ChromePicker
                  color={backgroundColor}
                  onChange={(color) => setBackgroundColor(color.hex)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="flex flex-col items-center mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          미리보기
        </label>
        <div ref={containerRef} className="w-32 h-32 border border-gray-300 rounded-md flex items-center justify-center overflow-hidden mb-4">
          <div
            ref={previewRef}
            className="w-32 h-32 flex items-center justify-center"
            style={{ backgroundColor }}
          >
            <div
              ref={textRef}
              style={{
                color,
                width: '112px',
                height: '112px',
                margin: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign,
                whiteSpace: text.includes('\n') ? 'pre' : 'nowrap',
                lineHeight: text.includes('\n') ? 1.2 : 'normal',
                wordBreak: text.includes('\n') ? 'break-all' : 'normal',
                fontFamily: selectedFont.value,
                fontWeight: isBold ? 'bold' : 'normal',
                fontStyle: isItalic ? 'italic' : 'normal',
                textDecoration: isStrikethrough ? 'line-through' : 'none',
                overflow: 'hidden',
              }}
            >
              {text || 'ABC'}
            </div>
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={!text.trim()}
          className={`px-6 py-2 text-white rounded-md transition-colors ${text.trim() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          다운로드
        </button>
      </div>
    </div>
  );
}

export default EmojiGenerator;
