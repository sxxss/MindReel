"""系统提示词构建。"""
from __future__ import annotations

import json
from collections.abc import Sequence

from pydantic import BaseModel


def build_system_prompt(*, role: str, schema: type[BaseModel], constraints: Sequence[str] = ()) -> str:
    parts = [
        role,
        "输出 JSON Schema：\n" + json.dumps(schema.model_json_schema(), ensure_ascii=False, indent=2),
        "只输出一个合法的 JSON 对象，不要任何解释文字、不要 ``` 代码围栏；"
        "所有数值字段必须是纯数字（如 400），绝不能写成表达式、函数调用或带单位的字符串。",
    ]
    if constraints:
        parts.append("硬性约束：\n" + "\n".join(f"- {c}" for c in constraints))
    return "\n\n".join(parts)


def with_revision_instructions(user_prompt: str, revision_notes: Sequence[str] = ()) -> str:
    if not revision_notes:
        return user_prompt
    return "\n\n".join([
        user_prompt,
        "修订要求：",
        *[f"{i + 1}. {note}" for i, note in enumerate(revision_notes)],
    ])
