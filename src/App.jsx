import React, { useState, useRef } from 'react';
import { ChromePicker } from 'react-color';
import { toPng } from 'html-to-image';
import { uploadEmojiToSlack, isSlackConfigured } from './services/slackService';

function App() {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const previewRef = useRef(null);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const slackEnabled = isSlackConfigured();

  const generateEmoji = async () => {
    if (!text) return null;
    
    try {
      const dataUrl = await toPng(previewRef.current, {
        width: 128,
        height: 128,
        quality: 1,
        pixelRatio: 1
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Slack 이모지 생성기
      </h1>
      
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                텍스트
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="이모지 텍스트 입력"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                폰트 크기: {fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="72"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
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
            <div
              ref={previewRef}
              className="w-32 h-32 mx-auto border border-gray-300 rounded-md flex items-center justify-center"
              style={{ backgroundColor }}
            >
              <span style={{ color, fontSize: `${fontSize}px` }}>
                {text || 'ABC'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          {error && (
            <div className="text-red-500 text-sm text-center mb-2">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
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
