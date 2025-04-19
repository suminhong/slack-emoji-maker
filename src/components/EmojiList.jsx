import React from 'react';

function EmojiList({ 
  searchQuery,
  setSearchQuery,
  emojis,
  isLoadingEmojis,
  emojiError,
  currentPage,
  totalPages,
  totalEmojis,
  setCurrentPage 
}) {
  return (
    <div style={{width: '560px', height: '1000px'}} className="bg-white shadow-lg rounded-lg p-8 flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-8">현재 등록된 이모지</h1>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="이모지 검색"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {isLoadingEmojis ? (
        <div className="flex-1 flex justify-center items-center" style={{minHeight: '700px'}}>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : emojiError ? (
        <div className="flex-1 flex justify-center items-center text-red-500" style={{minHeight: '700px'}}>{emojiError}</div>
      ) : emojis.length > 0 ? (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4">
            <div className="grid grid-cols-5 gap-6 min-h-0">
              {emojis.map(([name, url], index) => (
                <div key={`${name}-${index}`} className="text-center">
                  <img
                    src={url}
                    alt={name}
                    className="w-16 h-16 mx-auto mb-2"
                  />
                  <div className="text-sm truncate">{name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center space-x-2 mt-4 py-4 bg-white">
            {[
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 border rounded disabled:opacity-50"
                key="first"
              >
                &lt;&lt;
              </button>,
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 border rounded disabled:opacity-50"
                key="prev"
              >
                &lt;
              </button>,
              <span className="px-3 py-1" key="current">
                {currentPage} / {totalPages}
              </span>,
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border rounded disabled:opacity-50"
                key="next"
              >
                &gt;
              </button>,
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border rounded disabled:opacity-50"
                key="last"
              >
                &gt;&gt;
              </button>
            ]}
          </div>
          <div className="text-center text-sm text-gray-500">
            총 {totalEmojis}개 중 {(currentPage - 1) * 25 + 1}-{Math.min(currentPage * 25, totalEmojis)}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex justify-center items-center text-gray-500" style={{minHeight: '700px'}}>
          이모지가 없습니다
        </div>
      )}
    </div>
  );
}

export default EmojiList;
