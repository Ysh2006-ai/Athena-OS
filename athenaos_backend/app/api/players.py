from fastapi import APIRouter, HTTPException
from ..models.player_models import PlayerProfileRequest, PlayerProfileResponse
from ..services.player_engine import generate_player_profiles

router = APIRouter()

@router.post("/profile", response_model=PlayerProfileResponse)
async def player_profile_endpoint(request: PlayerProfileRequest):
    try:
        profiles = await generate_player_profiles(request.player_names, request.events, request.emotional_timeline)
        return PlayerProfileResponse(
            status="success",
            request_id=request.request_id,
            data=profiles
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
