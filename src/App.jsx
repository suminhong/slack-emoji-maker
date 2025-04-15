import React, { useState, useRef, useEffect } from 'react';
import { ChromePicker } from 'react-color';
import { toPng } from 'html-to-image';
import { uploadEmojiToSlack, isSlackConfigured } from './services/slackService';

const FONTS = [
  { name: '기본체', value: 'Pretendard' },
  { name: '둥근체', value: 'Poor Story' },
  { name: '고딕체', value: 'Black Han Sans' },
  { name: '손글씨체', value: 'Nanum Pen Script' }
];

function App() {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [textAlign, setTextAlign] = useState('center');
  const previewRef = useRef(null);
  const textRef = useRef(null);
  const containerRef = useRef(null);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const slackEnabled = isSlackConfigured();

  const calculateFontSize = () => {
    if (!textRef.current) return;

    const textElement = textRef.current;
    const containerSize = 128; // Fixed size for both preview and final image
    const padding = 8; // Reduced padding for larger text
    const availableSize = containerSize - (padding * 2);

    // Start with a larger font size
    let fontSize = 120;
    textElement.style.fontSize = `${fontSize}px`;

    // Binary search for the optimal font size
    let min = 1;
    let max = 120;

    while (min <= max) {
      fontSize = Math.floor((min + max) / 2);
      textElement.style.fontSize = `${fontSize}px`;

      const isWidthOk = textElement.scrollWidth <= availableSize;
      const isHeightOk = textElement.scrollHeight <= availableSize;

      if (isWidthOk && isHeightOk) {
        // Try a slightly larger size
        min = fontSize + 1;
      } else {
        // Text doesn't fit, try smaller
        max = fontSize - 1;
      }
    }

    // Set the final font size
    fontSize = max;
    textElement.style.fontSize = `${fontSize}px`;
  };

  useEffect(() => {
    calculateFontSize();
  }, [text, backgroundColor]);

  const generateEmoji = async () => {
    if (!text) return null;
    
    try {
      const dataUrl = await toPng(previewRef.current, {
        width: 128,
        height: 128,
        quality: 1,
        pixelRatio: 4
      });
      
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      return { dataUrl, blob };
    } catch (error) {
      console.error('Error generating emoji:', error);
      setError('이모지 생성 중 오류가 발생했습니다.');
      return null;
    }
  };

  const handleDownload = async () => {
    const emoji = await generateEmoji();
    if (!emoji) return;

    const link = document.createElement('a');
    link.href = emoji.dataUrl;
    link.download = `${text}.png`;
    link.click();
  };

  const handleSlackUpload = async () => {
    setIsUploading(true);
    setError('');
    
    try {
      const emoji = await generateEmoji();
      if (!emoji) return;

      await uploadEmojiToSlack(text, emoji.blob);
      alert('이모지가 성공적으로 업로드되었습니다!');
    } catch (error) {
      console.error('Error uploading to Slack:', error);
      setError('슬랙 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Slack 이모지 생성기
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-6">
          <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  텍스트
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                  placeholder="이모지 텍스트 입력"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  폰트
                </label>
                <select
                  value={selectedFont.value}
                  onChange={(e) => setSelectedFont(FONTS.find(font => font.value === e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {FONTS.map(font => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    텍스트 스타일
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setIsBold(!isBold)}
                      className={`px-4 py-2 border rounded-md ${isBold ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
                    >
                      <strong>B</strong>
                    </button>
                    <button
                      onClick={() => setIsItalic(!isItalic)}
                      className={`px-4 py-2 border rounded-md ${isItalic ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
                    >
                      <i>I</i>
                    </button>
                    <button
                      onClick={() => setIsStrikethrough(!isStrikethrough)}
                      className={`px-4 py-2 border rounded-md ${isStrikethrough ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
                    >
                      <span className="line-through">S</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    텍스트 정렬
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setTextAlign('left')}
                      className={`px-4 py-2 border rounded-md ${textAlign === 'left' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
                      title="왼쪽 정렬"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setTextAlign('center')}
                      className={`px-4 py-2 border rounded-md ${textAlign === 'center' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
                      title="가운데 정렬"
                    >
                      ↔
                    </button>
                    <button
                      onClick={() => setTextAlign('right')}
                      className={`px-4 py-2 border rounded-md ${textAlign === 'right' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
                      title="오른쪽 정렬"
                    >
                      →
                    </button>
                  </div>
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
                    whiteSpace: 'pre',
                    lineHeight: 1.2,
                    fontFamily: selectedFont.value,
                    fontWeight: isBold ? 'bold' : 'normal',
                    fontStyle: isItalic ? 'italic' : 'normal',
                    textDecoration: isStrikethrough ? 'line-through' : 'none',
                    overflow: 'hidden'
                  }}
                >
                  {text || 'ABC'}
                </div>
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
              {!slackEnabled && ' (토큰 필요)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
