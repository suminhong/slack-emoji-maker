import express from 'express';
import cors from 'cors';
import { WebClient } from '@slack/web-api';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Load environment variables from .env file
dotenv.config();

// Get token from environment variables
const token = process.env.VITE_SLACK_TOKEN;
console.log('Environment variables:', {
  VITE_SLACK_TOKEN: token ? 'Present' : 'Missing',
});

if (!token) {
  console.error('No Slack token found in environment variables');
  process.exit(1);
}

const client = new WebClient(token);

// Health check endpoint
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/emoji/list', async (req, res) => {
  try {
    console.log('Fetching emoji list...');
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      VITE_SLACK_TOKEN: process.env.VITE_SLACK_TOKEN ? 'Present' : 'Missing',
      TOKEN_LENGTH: process.env.VITE_SLACK_TOKEN?.length
    });
    
    const searchQuery = req.query.query || '';
    
    try {
      console.log('Calling Slack API...');
      const result = await client.emoji.list();
      console.log('Slack API Response:', JSON.stringify(result, null, 2));

      if (!result || !result.ok) {
        const error = result?.error || 'Unknown error';
        console.error('Slack API Error:', error);
        
        if (error === 'invalid_auth' || error === 'not_authed' || error === 'token_expired') {
          return res.status(401).json({ error: '이모지 읽기 권한이 없는 토큰입니다. 이모지 읽기 권한이 있는 토큰을 사용해주세요.' });
        }
        return res.status(500).json({ error: error || '이모지 목록을 가져오는데 실패했습니다.' });
      }

      if (!result.emoji || typeof result.emoji !== 'object') {
        console.error('Invalid emoji response:', result);
        return res.status(500).json({ error: '이모지 데이터가 유효하지 않습니다.' });
      }

      const emojis = Object.entries(result.emoji)
        .filter(([name]) => searchQuery ? name.includes(searchQuery.toLowerCase()) : true)
        .map(([name, url]) => ({ name, url }));

      console.log(`Found ${emojis.length} emojis`);
      return res.json({ emojis });
    } catch (slackError) {
      console.error('Slack API Error:', slackError);
      return res.status(500).json({ 
        error: '슬랙 API 통신 중 에러가 발생했습니다.',
        details: slackError.message
      });
    }
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ 
      error: '서버 에러가 발생했습니다.',
      details: error.message 
    });
  }
});

app.post('/api/emoji/add', async (req, res) => {
  try {
    const { name, image } = req.body;

    const result = await client.emoji.add({
      name: name.toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
      mode: 'data',
      image
    });

    if (!result.ok) {
      return res.status(500).json({ error: result.error || '이모지 업로드에 실패했습니다.' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error uploading emoji:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
