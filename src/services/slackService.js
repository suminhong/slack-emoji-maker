export const isSlackConfigured = () => {
  return import.meta.env.VITE_SLACK_TOKEN !== undefined && import.meta.env.VITE_SLACK_TOKEN !== '';
};

export const uploadEmojiToSlack = async (name, imageBlob) => {
  try {
    const token = import.meta.env.VITE_SLACK_TOKEN;
    if (!token) {
      throw new Error('Slack 토큰이 설정되지 않았습니다. .env 파일을 확인해주세요.');
    }

    // Convert Blob to Base64
    const reader = new FileReader();
    const base64Image = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(imageBlob);
    });

    // Upload to Slack using fetch API
    const response = await fetch('https://slack.com/api/emoji.add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name.toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
        mode: 'data',
        image: base64Image
      })
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.error || '이모지 업로드에 실패했습니다.');
    }

    return true;
  } catch (error) {
    console.error('Error uploading emoji to Slack:', error);
    throw error;
  }
};
