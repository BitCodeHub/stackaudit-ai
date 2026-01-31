"""
AI Code Provenance API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field
from datetime import datetime

from app.core.database import get_db
from app.models.ai_provenance import AIProvenanceScan, AICodeComponent
from app.services.ai_scanner import AICodeScanner

router = APIRouter()


# Pydantic schemas
class ScanRequest(BaseModel):
    """Request to start a new AI provenance scan"""
    branch: str = Field(default="main", description="Branch to scan")
    commit_hash: Optional[str] = Field(None, description="Specific commit hash (optional)")
    full_scan: bool = Field(default=True, description="Full repository scan vs incremental")


class ScanResponse(BaseModel):
    """Response from scan initiation"""
    scan_id: UUID
    status: str
    estimated_duration_seconds: int

    class Config:
        from_attributes = True


class ScanResultResponse(BaseModel):
    """Scan results"""
    id: UUID
    repository_id: UUID
    commit_hash: str
    status: str
    total_lines: Optional[int]
    ai_lines: Optional[int]
    human_lines: Optional[int]
    ai_percentage: Optional[float]
    detection_methods: Optional[dict]
    scan_duration_ms: Optional[int]
    completed_at: Optional[datetime]
    error_message: Optional[str]

    class Config:
        from_attributes = True


class AIComponentResponse(BaseModel):
    """AI code component"""
    id: UUID
    file_path: str
    lines_start: int
    lines_end: int
    ai_tool: str
    model_version: Optional[str]
    detection_method: str
    confidence: float
    developer_id: Optional[str]
    timestamp: Optional[datetime]

    class Config:
        from_attributes = True


class ComponentListResponse(BaseModel):
    """List of AI components"""
    scan_id: UUID
    total_components: int
    components: List[AIComponentResponse]


@router.post("/repos/{repo_id}/ai-provenance/scan", response_model=ScanResponse)
async def trigger_scan(
    repo_id: UUID,
    scan_request: ScanRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Trigger an AI code provenance scan for a repository
    """
    # Create scan record
    scan = AIProvenanceScan(
        repository_id=repo_id,
        commit_hash=scan_request.commit_hash or "HEAD",
        branch=scan_request.branch,
        status="pending"
    )
    
    db.add(scan)
    db.commit()
    db.refresh(scan)

    # Queue background scanning task
    scanner = AICodeScanner()
    background_tasks.add_task(
        scanner.scan_repository,
        scan_id=str(scan.id),
        repo_id=str(repo_id),
        branch=scan_request.branch,
        commit_hash=scan_request.commit_hash,
        full_scan=scan_request.full_scan
    )

    return ScanResponse(
        scan_id=scan.id,
        status=scan.status,
        estimated_duration_seconds=180  # 3 minutes estimate
    )


@router.get("/scans/{scan_id}", response_model=ScanResultResponse)
async def get_scan_results(
    scan_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get scan status and results
    """
    scan = db.query(AIProvenanceScan).filter(AIProvenanceScan.id == scan_id).first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    return ScanResultResponse(
        id=scan.id,
        repository_id=scan.repository_id,
        commit_hash=scan.commit_hash,
        status=scan.status,
        total_lines=scan.total_lines,
        ai_lines=scan.ai_lines,
        human_lines=scan.human_lines,
        ai_percentage=float(scan.ai_percentage) if scan.ai_percentage else None,
        detection_methods=scan.detection_methods,
        scan_duration_ms=scan.scan_duration_ms,
        completed_at=scan.updated_at if scan.status == "completed" else None,
        error_message=scan.error_message
    )


@router.get("/scans/{scan_id}/components", response_model=ComponentListResponse)
async def get_scan_components(
    scan_id: UUID,
    file_path: Optional[str] = None,
    ai_tool: Optional[str] = None,
    min_confidence: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """
    Get AI code components detected in scan
    """
    # Verify scan exists
    scan = db.query(AIProvenanceScan).filter(AIProvenanceScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    # Build query with filters
    query = db.query(AICodeComponent).filter(AICodeComponent.scan_id == scan_id)
    
    if file_path:
        query = query.filter(AICodeComponent.file_path.ilike(f"%{file_path}%"))
    
    if ai_tool:
        query = query.filter(AICodeComponent.ai_tool == ai_tool)
    
    if min_confidence is not None:
        query = query.filter(AICodeComponent.confidence >= min_confidence)

    components = query.all()

    return ComponentListResponse(
        scan_id=scan_id,
        total_components=len(components),
        components=[
            AIComponentResponse(
                id=c.id,
                file_path=c.file_path,
                lines_start=c.lines_start,
                lines_end=c.lines_end,
                ai_tool=c.ai_tool,
                model_version=c.model_version,
                detection_method=c.detection_method,
                confidence=float(c.confidence),
                developer_id=c.developer_id,
                timestamp=c.timestamp
            )
            for c in components
        ]
    )


@router.get("/repos/{repo_id}/ai-provenance/latest", response_model=ScanResultResponse)
async def get_latest_scan(
    repo_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get the latest scan results for a repository
    """
    scan = (
        db.query(AIProvenanceScan)
        .filter(AIProvenanceScan.repository_id == repo_id)
        .order_by(AIProvenanceScan.scan_date.desc())
        .first()
    )

    if not scan:
        raise HTTPException(status_code=404, detail="No scans found for this repository")

    return ScanResultResponse(
        id=scan.id,
        repository_id=scan.repository_id,
        commit_hash=scan.commit_hash,
        status=scan.status,
        total_lines=scan.total_lines,
        ai_lines=scan.ai_lines,
        human_lines=scan.human_lines,
        ai_percentage=float(scan.ai_percentage) if scan.ai_percentage else None,
        detection_methods=scan.detection_methods,
        scan_duration_ms=scan.scan_duration_ms,
        completed_at=scan.updated_at if scan.status == "completed" else None,
        error_message=scan.error_message
    )
