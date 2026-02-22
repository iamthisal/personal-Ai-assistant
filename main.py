from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app import router

app = FastAPI(title="Ai-Assistant")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static assets (CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API router
app.include_router(router)


# Serve frontend
@app.get("/")
async def serve_frontend():
    return FileResponse("static/index.html")




