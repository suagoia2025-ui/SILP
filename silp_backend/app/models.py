# app/models.py
from sqlalchemy import Column, String, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from sqlalchemy.sql import func
import uuid
from .database import Base

class Municipality(Base):
    __tablename__ = "municipalities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    department = Column(String(100), nullable=False)

class Occupation(Base):
    __tablename__ = "occupations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    cedula = Column(String(20), unique=True, nullable=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(String(20), nullable=False)
    address = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    mdv = Column(String(255), nullable=True)
    municipality_id = Column(Integer, ForeignKey("municipalities.id"), nullable=True)
    occupation_id = Column(Integer, ForeignKey("occupations.id"), nullable=True)

    municipality = relationship("Municipality")
    occupation = relationship("Occupation")

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    cedula = Column(String(20), unique=True, nullable=True, index=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    mdv = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
   
    # Claves Foráneas
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    municipality_id = Column(Integer, ForeignKey("municipalities.id"), nullable=True)
    occupation_id = Column(Integer, ForeignKey("occupations.id"), nullable=True)

   
    # Relación
    owner = relationship("User")
    municipality = relationship("Municipality") 
    occupation = relationship("Occupation")   