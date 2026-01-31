"""
AI Provenance Tables

Revision ID: 002_ai_provenance
Revises: 001
Create Date: 2026-01-30 20:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '002_ai_provenance'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create AI provenance tables"""
    
    # ai_provenance_scans table
    op.create_table(
        'ai_provenance_scans',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('repository_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('commit_hash', sa.String(40), nullable=False),
        sa.Column('branch', sa.String(255), server_default='main'),
        sa.Column('scan_date', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('total_files', sa.Integer),
        sa.Column('total_lines', sa.Integer),
        sa.Column('ai_lines', sa.Integer),
        sa.Column('human_lines', sa.Integer),
        sa.Column('ai_percentage', sa.DECIMAL(5, 2)),
        sa.Column('detection_methods', postgresql.JSONB),
        sa.Column('scan_duration_ms', sa.Integer),
        sa.Column('error_message', sa.Text),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_scans_repo_commit', 'ai_provenance_scans', ['repository_id', 'commit_hash'])
    op.create_index('idx_scans_status', 'ai_provenance_scans', ['status'])

    # ai_code_components table
    op.create_table(
        'ai_code_components',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('scan_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('file_path', sa.Text, nullable=False),
        sa.Column('lines_start', sa.Integer, nullable=False),
        sa.Column('lines_end', sa.Integer, nullable=False),
        sa.Column('ai_tool', sa.String(100), nullable=False),
        sa.Column('model_version', sa.String(100)),
        sa.Column('detection_method', sa.String(50), nullable=False),
        sa.Column('confidence', sa.DECIMAL(5, 4), nullable=False),
        sa.Column('developer_id', sa.String(255)),
        sa.Column('timestamp', sa.DateTime(timezone=True)),
        sa.Column('code_snippet', sa.Text),
        sa.Column('features', postgresql.JSONB),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['scan_id'], ['ai_provenance_scans.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_components_scan', 'ai_code_components', ['scan_id'])
    op.create_index('idx_components_file', 'ai_code_components', ['file_path'])
    op.create_index('idx_components_tool', 'ai_code_components', ['ai_tool'])

    # aibom_exports table
    op.create_table(
        'aibom_exports',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('scan_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('format', sa.String(20), nullable=False),
        sa.Column('version', sa.String(10), nullable=False),
        sa.Column('file_path', sa.Text, nullable=False),
        sa.Column('signed', sa.Boolean, server_default='false'),
        sa.Column('signature_bundle', sa.Text),
        sa.Column('export_date', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['scan_id'], ['ai_provenance_scans.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_exports_scan', 'aibom_exports', ['scan_id'])

    # copilot_usage_cache table
    op.create_table(
        'copilot_usage_cache',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('organization_name', sa.String(255), nullable=False),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('usage_data', postgresql.JSONB, nullable=False),
        sa.Column('fetched_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_name', 'date', name='uq_org_date')
    )
    op.create_index('idx_usage_org_date', 'copilot_usage_cache', ['organization_name', 'date'])


def downgrade() -> None:
    """Drop AI provenance tables"""
    op.drop_table('copilot_usage_cache')
    op.drop_table('aibom_exports')
    op.drop_table('ai_code_components')
    op.drop_table('ai_provenance_scans')
