"""
AI Code Provenance Models
"""
from sqlalchemy import Column, String, Integer, DECIMAL, Text, Boolean, ForeignKey, DateTime, Date, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.models.base import Base, TimestampMixin


class AIProvenanceScan(Base, TimestampMixin):
    """AI provenance scan record"""
    __tablename__ = "ai_provenance_scans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id = Column(UUID(as_uuid=True), nullable=False)  # FK to repositories table
    commit_hash = Column(String(40), nullable=False)
    branch = Column(String(255), default="main")
    scan_date = Column(DateTime(timezone=True), default=datetime.utcnow)
    status = Column(String(20), nullable=False)  # pending, running, completed, failed
    total_files = Column(Integer)
    total_lines = Column(Integer)
    ai_lines = Column(Integer)
    human_lines = Column(Integer)
    ai_percentage = Column(DECIMAL(5, 2))
    detection_methods = Column(JSONB)  # {"telemetry": 1234, "pattern": 5678, "timing": 90}
    scan_duration_ms = Column(Integer)
    error_message = Column(Text)

    # Relationships
    components = relationship("AICodeComponent", back_populates="scan", cascade="all, delete-orphan")
    exports = relationship("AIBOMExport", back_populates="scan", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<AIProvenanceScan {self.id} - {self.status}>"


class AICodeComponent(Base, TimestampMixin):
    """AI-generated code component detected in a scan"""
    __tablename__ = "ai_code_components"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scan_id = Column(UUID(as_uuid=True), ForeignKey("ai_provenance_scans.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(Text, nullable=False)
    lines_start = Column(Integer, nullable=False)
    lines_end = Column(Integer, nullable=False)
    ai_tool = Column(String(100), nullable=False)  # GitHub Copilot, ChatGPT, Claude, etc.
    model_version = Column(String(100))
    detection_method = Column(String(50), nullable=False)  # telemetry, pattern, timing
    confidence = Column(DECIMAL(5, 4), nullable=False)  # 0.0000 to 1.0000
    developer_id = Column(String(255))
    timestamp = Column(DateTime(timezone=True))
    code_snippet = Column(Text)
    features = Column(JSONB)  # ML features for debugging

    # Relationships
    scan = relationship("AIProvenanceScan", back_populates="components")

    def __repr__(self):
        return f"<AICodeComponent {self.file_path}:{self.lines_start}-{self.lines_end}>"


class AIBOMExport(Base, TimestampMixin):
    """AIBOM export record"""
    __tablename__ = "aibom_exports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scan_id = Column(UUID(as_uuid=True), ForeignKey("ai_provenance_scans.id"), nullable=False)
    format = Column(String(20), nullable=False)  # cyclonedx, spdx
    version = Column(String(10), nullable=False)
    file_path = Column(Text, nullable=False)
    signed = Column(Boolean, default=False)
    signature_bundle = Column(Text)  # Sigstore bundle
    export_date = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    scan = relationship("AIProvenanceScan", back_populates="exports")

    def __repr__(self):
        return f"<AIBOMExport {self.format} v{self.version}>"


class CopilotUsageCache(Base, TimestampMixin):
    """Cached GitHub Copilot usage data"""
    __tablename__ = "copilot_usage_cache"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_name = Column(String(255), nullable=False)
    date = Column(Date, nullable=False)
    usage_data = Column(JSONB, nullable=False)  # Raw GitHub API response
    fetched_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('organization_name', 'date', name='uq_org_date'),
    )

    def __repr__(self):
        return f"<CopilotUsageCache {self.organization_name} - {self.date}>"
