export const isSlackConfigured = () => {
  return import.meta.env.VITE_SLACK_TOKEN !== undefined && import.meta.env.VITE_SLACK_TOKEN !== '';
};

export const listEmojis = async (searchQuery = '', page = 1) => {
  try {
    const response = await fetch(`http://localhost:3000/emoji/list?query=${encodeURIComponent(searchQuery)}&page=${page}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || '이모지 목록을 가져오는데 실패했습니다.');
    }

    return {
      emojis: data.emojis,
      total: data.total,
      page: data.page,
      perPage: data.per_page,
      totalPages: data.total_pages
    };
  } catch (error) {
    console.error('Error fetching emojis:', error);
    throw error;
  }
};

export const uploadEmoji = async (formData) => {
  try {
    const response = await fetch('http://localhost:3000/api/emojis/add', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || '이모지 업로드에 실패했습니다.');
    }

    return true;
  } catch (error) {
    console.error('Error uploading emoji to Slack:', error);
    throw error;
  }
};
