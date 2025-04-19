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
  selectedFont,
  setSelectedFont,
  isBold,
  setIsBold,
  isItalic,
  setIsItalic,
  isStrikethrough,
  setIsStrikethrough,
  textAlign,
  setTextAlign,
  error,
  isUploading,
  slackEnabled,
  FONTS,
  previewRef,
  textRef,
  containerRef,
  handleDownload,
  handleSlackUpload
}) {
  return (
    <div style={{width: '560px', height: '1000px'}} className="bg-white shadow-lg rounded-lg p-8 flex flex-col">
      <h1 className="text-3xl font-bold text-center mb-8">이모지 생성기</h1>
      <div className="space-y-6 flex-1 overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            텍스트
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="이모지로 만들 텍스트를 입력하세요"
            rows="3"
          />
        </div>

        <div>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {FONTS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            텍스트 스타일
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsBold(!isBold)}
              className={`px-4 py-2 border rounded-md ${isBold ? 'bg-gray-200' : ''}`}
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => setIsItalic(!isItalic)}
              className={`px-4 py-2 border rounded-md ${isItalic ? 'bg-gray-200' : ''}`}
            >
              <em>I</em>
            </button>
            <button
              onClick={() => setIsStrikethrough(!isStrikethrough)}
              className={`px-4 py-2 border rounded-md ${isStrikethrough ? 'bg-gray-200' : ''}`}
            >
              <span className="line-through">S</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            텍스트 정렬
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => setTextAlign('left')}
              className={`flex-1 px-4 py-2 border rounded-md ${textAlign === 'left' ? 'bg-gray-200' : ''}`}
            >
              왼쪽
            </button>
            <button
              onClick={() => setTextAlign('center')}
              className={`flex-1 px-4 py-2 border rounded-md ${textAlign === 'center' ? 'bg-gray-200' : ''}`}
            >
              가운데
            </button>
            <button
              onClick={() => setTextAlign('right')}
              className={`flex-1 px-4 py-2 border rounded-md ${textAlign === 'right' ? 'bg-gray-200' : ''}`}
            >
              오른쪽
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            텍스트 색상
          </label>
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md flex items-center"
            >
              <div
                className="w-6 h-6 rounded mr-2"
                style={{ backgroundColor: color }}
              />
              {color}
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            배경 색상
          </label>
          <div className="relative">
            <button
              onClick={() => setShowBgColorPicker(!showBgColorPicker)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md flex items-center"
            >
              <div
                className="w-6 h-6 rounded mr-2"
                style={{ backgroundColor: backgroundColor }}
              />
              {backgroundColor}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            미리보기
          </label>
          <div ref={containerRef} className="w-32 h-32 mx-auto border border-gray-300 rounded-md flex items-center justify-center overflow-hidden">
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
        </div>

        <div className="mt-6 space-y-3">
          {error && (
            <div className="text-red-500 text-sm text-center mb-2">
              {error}
            </div>
          )}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleDownload}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
              disabled={!text}
            >
              다운로드
            </button>
            <button
              onClick={handleSlackUpload}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={!text || isUploading || !slackEnabled}
              title={!slackEnabled ? 'Slack 토큰이 설정되지 않았습니다' : ''}
            >
              {isUploading ? '업로드 중...' : '슬랙에 추가'}
              {slackEnabled ? '' : ' (토큰 필요)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmojiGenerator;
