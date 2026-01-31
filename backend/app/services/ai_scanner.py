"""
AI Code Scanner Service
Detects AI-generated code in repositories using multiple detection methods
"""
import time
import re
from typing import List, Dict, Optional
from datetime import datetime
from uuid import UUID
import logging

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.ai_provenance import AIProvenanceScan, AICodeComponent

logger = logging.getLogger(__name__)


class AICodeScanner:
    """Main AI code detection service"""

    def __init__(self):
        self.pattern_detector = PatternBasedDetector()

    async def scan_repository(
        self,
        scan_id: str,
        repo_id: str,
        branch: str,
        commit_hash: Optional[str],
        full_scan: bool
    ):
        """
        Scan a repository for AI-generated code
        """
        db = SessionLocal()
        start_time = time.time()

        try:
            # Update scan status to running
            scan = db.query(AIProvenanceScan).filter(AIProvenanceScan.id == UUID(scan_id)).first()
            if not scan:
                logger.error(f"Scan {scan_id} not found")
                return

            scan.status = "running"
            db.commit()

            # For MVP: Use pattern-based detection on mock data
            # In production: Fetch real repository code from GitHub/GitLab
            components = await self._scan_mock_repository(scan_id, repo_id)

            # Calculate aggregate statistics
            total_files = len(set(c.file_path for c in components))
            total_lines = sum(c.lines_end - c.lines_start + 1 for c in components)
            ai_lines = sum(
                c.lines_end - c.lines_start + 1
                for c in components
                if c.confidence >= 0.5
            )
            human_lines = total_lines - ai_lines

            detection_methods = {
                "pattern": len([c for c in components if c.detection_method == "pattern"]),
                "telemetry": 0,  # Not implemented yet
                "timing": 0  # Not implemented yet
            }

            # Save components to database
            for component in components:
                db.add(component)

            # Update scan with results
            scan.status = "completed"
            scan.total_files = total_files
            scan.total_lines = total_lines
            scan.ai_lines = ai_lines
            scan.human_lines = human_lines
            scan.ai_percentage = (ai_lines / total_lines * 100) if total_lines > 0 else 0
            scan.detection_methods = detection_methods
            scan.scan_duration_ms = int((time.time() - start_time) * 1000)

            db.commit()
            logger.info(f"Scan {scan_id} completed successfully - {ai_lines}/{total_lines} AI lines detected")

        except Exception as e:
            logger.error(f"Scan {scan_id} failed: {str(e)}")
            scan = db.query(AIProvenanceScan).filter(AIProvenanceScan.id == UUID(scan_id)).first()
            if scan:
                scan.status = "failed"
                scan.error_message = str(e)
                scan.scan_duration_ms = int((time.time() - start_time) * 1000)
                db.commit()

        finally:
            db.close()

    async def _scan_mock_repository(self, scan_id: str, repo_id: str) -> List[AICodeComponent]:
        """
        Mock repository scan for MVP demonstration
        In production: Replace with real GitHub/GitLab integration
        """
        # Sample code files with AI-generated indicators
        mock_files = {
            "src/utils/api_client.py": """
import requests
from typing import Optional, Dict, Any

class APIClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })
    
    def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        response = self.session.get(f"{self.base_url}/{endpoint}", params=params)
        response.raise_for_status()
        return response.json()
    
    def post(self, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        response = self.session.post(f"{self.base_url}/{endpoint}", json=data)
        response.raise_for_status()
        return response.json()
""",
            "src/models/user.py": """
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class User(BaseModel):
    id: int
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    created_at: datetime
    is_active: bool = True
    role: str = "user"
    
    class Config:
        from_attributes = True
""",
            "tests/test_api.py": """
import pytest
from unittest.mock import Mock, patch

def test_api_client_get_success():
    with patch('requests.Session.get') as mock_get:
        mock_response = Mock()
        mock_response.json.return_value = {'data': 'test'}
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        result = client.get('users')
        assert result == {'data': 'test'}
"""
        }

        components = []

        for file_path, code in mock_files.items():
            # Use pattern detector to find AI-generated code
            file_components = self.pattern_detector.detect_ai_code(
                scan_id=UUID(scan_id),
                file_path=file_path,
                code=code,
                language="python"
            )
            components.extend(file_components)

        return components


class PatternBasedDetector:
    """
    Pattern-based AI code detection
    Analyzes code for common AI-generated patterns
    """

    # Common AI-generated code patterns
    AI_INDICATORS = [
        # Boilerplate patterns
        r'class \w+\(BaseModel\):',  # Pydantic models
        r'def __init__\(self[^)]*\):',  # Standard constructors
        r'from typing import',  # Type hints (common in AI code)
        r'import pytest',  # Test frameworks
        
        # Generic naming patterns
        r'\bresponse\b',
        r'\bdata\b',
        r'\bresult\b',
        r'\bparams\b',
        
        # Common AI completion patterns
        r'\.raise_for_status\(\)',
        r'\.json\(\)',
        r'Mock\(\)',
        r'@patch\(',
    ]

    def detect_ai_code(
        self,
        scan_id: UUID,
        file_path: str,
        code: str,
        language: str
    ) -> List[AICodeComponent]:
        """
        Detect AI-generated code using pattern matching
        """
        components = []
        lines = code.split('\n')

        # Analyze code in chunks (functions, classes)
        chunks = self._split_into_chunks(code)

        for chunk in chunks:
            confidence = self._calculate_ai_probability(chunk)

            if confidence > 0.5:  # Threshold for AI detection
                # Find line numbers
                start_line = code[:code.find(chunk)].count('\n') + 1
                end_line = start_line + chunk.count('\n')

                component = AICodeComponent(
                    scan_id=scan_id,
                    file_path=file_path,
                    lines_start=start_line,
                    lines_end=end_line,
                    ai_tool="Unknown (Pattern-Based)",
                    model_version=None,
                    detection_method="pattern",
                    confidence=round(confidence, 4),
                    developer_id=None,
                    timestamp=datetime.utcnow(),
                    code_snippet=chunk[:200],  # Store first 200 chars
                    features={
                        "indicators_found": self._get_matching_patterns(chunk),
                        "chunk_length": len(chunk),
                        "line_count": chunk.count('\n')
                    }
                )
                components.append(component)

        return components

    def _split_into_chunks(self, code: str) -> List[str]:
        """
        Split code into logical chunks (functions, classes)
        Simplified version - in production use tree-sitter AST
        """
        chunks = []
        current_chunk = []
        indent_level = 0

        for line in code.split('\n'):
            stripped = line.strip()

            # Detect function/class definitions
            if stripped.startswith('def ') or stripped.startswith('class '):
                if current_chunk:
                    chunks.append('\n'.join(current_chunk))
                    current_chunk = []
                indent_level = len(line) - len(line.lstrip())

            current_chunk.append(line)

            # End of function/class (return to base indent)
            if stripped and not stripped.startswith('#'):
                current_indent = len(line) - len(line.lstrip())
                if current_indent <= indent_level and len(current_chunk) > 1:
                    if current_indent == 0:
                        chunks.append('\n'.join(current_chunk))
                        current_chunk = []

        if current_chunk:
            chunks.append('\n'.join(current_chunk))

        return [c for c in chunks if c.strip()]

    def _calculate_ai_probability(self, code_chunk: str) -> float:
        """
        Calculate probability that code chunk is AI-generated
        """
        score = 0.0
        max_score = len(self.AI_INDICATORS)

        for pattern in self.AI_INDICATORS:
            if re.search(pattern, code_chunk):
                score += 1

        # Normalize to 0-1 range
        base_probability = score / max_score

        # Additional heuristics
        lines = code_chunk.split('\n')
        avg_line_length = sum(len(line) for line in lines) / max(len(lines), 1)

        # AI code tends to have consistent line lengths
        if 40 <= avg_line_length <= 80:
            base_probability += 0.1

        # Generic variable names
        generic_vars = len(re.findall(r'\b(data|result|response|item|value|temp)\b', code_chunk))
        if generic_vars >= 2:
            base_probability += 0.1

        # Cap at 0.95 for pattern-based detection (never 100% certain without telemetry)
        return min(base_probability, 0.95)

    def _get_matching_patterns(self, code_chunk: str) -> List[str]:
        """
        Get list of AI indicator patterns found in code
        """
        matches = []
        for pattern in self.AI_INDICATORS:
            if re.search(pattern, code_chunk):
                matches.append(pattern)
        return matches
