from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from dotenv import load_dotenv
import os
import base64

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Slack 클라이언트 초기화
client = WebClient(token=os.getenv("VITE_SLACK_TOKEN"))

@app.get("/ping")
async def ping():
    return {"status": "ok", "timestamp": os.getenv("VITE_SLACK_TOKEN", "")[:4] + "..."}

@app.get("/emoji/list")
async def list_emojis(query: str = "", page: int = 1, per_page: int = 25):
    try:
        result = client.emoji_list()
        
        if not result["ok"]:
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "이모지 목록을 가져오는데 실패했습니다.")
            )
        
        # 커스텀 이모지만 필터링 (URL 형식인 것만 선택)
        custom_emojis = {name: url for name, url in result["emoji"].items()
                        if url.startswith('http')}
        
        # 검색어가 있으면 추가 필터링
        if query:
            emojis = {name: url for name, url in custom_emojis.items()
                     if query.lower() in name.lower()}
        else:
            emojis = custom_emojis
        
        # 리스트로 변환하고 정렬
        emoji_list = sorted(list(emojis.items()))
        
        # 페이지네이션
        total = len(emoji_list)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_emojis = emoji_list[start_idx:end_idx]
        
        return {
            "emojis": paginated_emojis,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page
        }
    
    except SlackApiError as e:
        if "invalid_auth" in str(e) or "not_authed" in str(e) or "token_expired" in str(e):
            raise HTTPException(
                status_code=401,
                detail="이모지 읽기 권한이 없는 토큰입니다. 이모지 읽기 권한이 있는 토큰을 사용해주세요."
            )
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/emoji/add")
async def add_emoji(name: str, image: str):
    try:
        # 이름 정리
        name = name.lower().replace(" ", "_")
        
        # Base64 이미지 처리
        if "base64," in image:
            image = image.split("base64,")[1]
        
        result = client.emoji_add(
            name=name,
            image=image
        )
        
        if not result["ok"]:
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "이모지 업로드에 실패했습니다.")
            )
        
        return {"success": True}
    
    except SlackApiError as e:
        raise HTTPException(status_code=500, detail=str(e))
