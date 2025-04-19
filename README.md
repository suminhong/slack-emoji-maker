# Slack Emoji Generator

슬랙 이모지를 쉽게 만들고 직접 워크스페이스에 업로드할 수 있는 웹 서비스입니다.

## 주요 기능

- 텍스트 기반 이모지 생성
- 폰트 크기, 색상 커스터마이징
- 생성된 이모지 미리보기
- 슬랙 워크스페이스에 직접 업로드

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 환경 변수 설정

`.env` 파일을 생성하고 다음 값들을 설정하세요:

```
SLACK_CLIENT_SECRET=your_slack_client_secret
```

## Slack App 설정

1. [Slack API 웹사이트](https://api.slack.com/apps)에서 새 앱을 생성
2. "OAuth & Permissions" 섹션에서 다음 스코프 추가:
   - `emoji:write`
3. 앱 설치 및 OAuth 토큰 발급
