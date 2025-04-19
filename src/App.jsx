import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { uploadEmojiToSlack, isSlackConfigured, listEmojis } from './services/slackService';
import EmojiList from './components/EmojiList';
import EmojiGenerator from './components/EmojiGenerator';

const FONTS = [
  { name: '배민한나체', value: '배민한나체' },
  { name: '배민을지로체', value: '배민을지로체' },
  { name: '평창평화체', value: 'PyeongChangPeace' },
  { name: '학교안심체', value: '학교안심체' },
  { name: '여기어때잘난체', value: '여기어때잘난체' },
];

function App() {
  const [text, setText] = useState('');
  const [emojis, setEmojis] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmojis, setTotalEmojis] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [emojiError, setEmojiError] = useState(null);
  const [isLoadingEmojis, setIsLoadingEmojis] = useState(false);
  const [color, setColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [textAlign, setTextAlign] = useState('center');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  
  const previewRef = useRef(null);
  const textRef = useRef(null);
  const containerRef = useRef(null);
  
  const slackEnabled = isSlackConfigured();

  // 텍스트 크기 자동 조절 함수
  const adjustTextSize = () => {
    if (!textRef.current || !previewRef.current) return;

    const textElement = textRef.current;
    const containerWidth = 112; // 128px - (8px padding * 2)
    const containerHeight = 112;

    // Binary search for optimal font size
    let min = 1;
    let max = 200; // Increased max size for better scaling

    while (min <= max) {
      const mid = Math.floor((min + max) / 2);
      textElement.style.fontSize = `${mid}px`;

      if (textElement.scrollWidth <= containerWidth && textElement.scrollHeight <= containerHeight) {
        min = mid + 1;
      } else {
        max = mid - 1;
      }
    }

    // Use 90% of the found size for safety margin
    const finalSize = Math.floor(max * 0.9);
    textElement.style.fontSize = `${Math.max(1, finalSize)}px`;
  };

  // 텍스트, 폰트, 정렬 변경시 크기 재조정
  useEffect(() => {
    adjustTextSize();
  }, [text, selectedFont, textAlign]);


  useEffect(() => {
    adjustTextSize();
  }, [text, backgroundColor, selectedFont, textAlign, isBold, isItalic]);

  const loadEmojis = async () => {
    setIsLoadingEmojis(true);
    setEmojiError(null);
    try {
      const result = await listEmojis(searchQuery, currentPage);
      setEmojis(result.emojis);
      setTotalPages(result.totalPages);
      setTotalEmojis(result.total);
    } catch (error) {
      console.error('Error loading emojis:', error);
      setEmojiError(error.message);
      setEmojis([]);
      setTotalPages(1);
      setTotalEmojis(0);
    } finally {
      setIsLoadingEmojis(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // 검색어가 변경되면 첫 페이지로 돌아가기
  }, [searchQuery]);

  useEffect(() => {
    loadEmojis();
  }, [searchQuery, currentPage]);

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-[960px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <EmojiGenerator
            text={text}
            setText={setText}
            color={color}
            setColor={setColor}
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
            showColorPicker={showColorPicker}
            setShowColorPicker={setShowColorPicker}
            showBgColorPicker={showBgColorPicker}
            setShowBgColorPicker={setShowBgColorPicker}
            selectedFont={selectedFont}
            setSelectedFont={setSelectedFont}
            isBold={isBold}
            setIsBold={setIsBold}
            isItalic={isItalic}
            setIsItalic={setIsItalic}
            isStrikethrough={isStrikethrough}
            setIsStrikethrough={setIsStrikethrough}
            textAlign={textAlign}
            setTextAlign={setTextAlign}
            error={error}
            isUploading={isUploading}
            slackEnabled={slackEnabled}
            FONTS={FONTS}
            previewRef={previewRef}
            textRef={textRef}
            containerRef={containerRef}
            handleDownload={handleDownload}
            handleSlackUpload={handleSlackUpload}
          />
          <EmojiList
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            emojis={emojis}
            isLoadingEmojis={isLoadingEmojis}
            emojiError={emojiError}
            currentPage={currentPage}
            totalPages={totalPages}
            totalEmojis={totalEmojis}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
