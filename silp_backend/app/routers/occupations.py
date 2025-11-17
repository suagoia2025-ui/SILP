# app/routers/occupations.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app import crud, schemas
from app.database import get_db

router = APIRouter()

@router.get("/occupations/", response_model=List[schemas.Occupation], tags=["Occupations"])
def read_occupations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    occupations = crud.get_occupations(db, skip=skip, limit=limit)
    return occupations