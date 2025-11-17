# app/routers/municipalities.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app import crud, schemas
from app.database import get_db

router = APIRouter()

@router.get("/municipalities/", response_model=List[schemas.Municipality], tags=["Municipalities"])
def read_municipalities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    municipalities = crud.get_municipalities(db, skip=skip, limit=limit)
    return municipalities