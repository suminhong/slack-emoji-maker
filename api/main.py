from fastapi import FastAPI, HTTPException, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from dotenv import load_dotenv
import os

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

@app.post("/api/emojis/add")
async def add_emoji(file: UploadFile, name: str = Form(...)):
    try:
        client = WebClient(token=os.getenv("VITE_SLACK_TOKEN"))
        
        # Read the file content
        contents = await file.read()
        
        # Convert the name to lowercase and replace invalid characters
        name = name.lower().replace(" ", "_")
        
        try:
            # Add the emoji using base64 image data
            response = client.admin_emoji_add(
                name=name,
                image=contents,  # Send raw binary data
                team_id=os.getenv("VITE_SLACK_TEAM_ID")
            )
            
            return {"success": True}
            
        except SlackApiError as e:
            error_message = str(e.response["error"])
            if error_message == "admin_not_found":
                raise HTTPException(status_code=403, detail="'admin.teams:write' 권한이 필요합니다")
            elif error_message == "error_name_taken":
                raise HTTPException(status_code=400, detail="동일한 이름의 이모지가 이미 존재합니다")
            elif error_message == "invalid_name":
                raise HTTPException(status_code=400, detail="이모지 이름이 유효하지 않습니다")
            elif error_message == "invalid_img":
                raise HTTPException(status_code=400, detail="이미지 형식이 유효하지 않습니다")
            else:
                raise HTTPException(status_code=400, detail=f"Slack API 에러: {error_message}")
                
    except Exception as e:
        print(f"Error uploading emoji: {str(e)}")
        raise HTTPException(status_code=500, detail=f"서버 에러: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
