import re

from members.models import AuditLog


SENSITIVE_METADATA_PATTERN = re.compile(
    r"\b(password|passcode|jwt|token|authorization|bearer|secret|api[ _-]?key)\b",
    re.IGNORECASE,
)


def _safe_metadata_summary(value):
    """Keep audit summaries useful without allowing credentials into the log."""
    summary = str(value or "").strip()
    if SENSITIVE_METADATA_PATTERN.search(summary):
        return "Sensitive detail omitted"
    return summary[:255]


def record_audit_log(
    *, user, actor, action, target_type, target_id=None, target_name,
    metadata_summary="", actor_label="",
):
    """Persist a concise, non-sensitive record of an administrative action."""
    return AuditLog.objects.create(
        user=user,
        actor=actor,
        actor_label=str(actor_label or "")[:255],
        action=action,
        target_type=target_type,
        target_id=target_id,
        target_name=str(target_name)[:255],
        metadata_summary=_safe_metadata_summary(metadata_summary),
    )
