"""Agent 运行器。

调 LLM 拿 JSON → 用 Pydantic 校验 → 不合法就带着错误重试(最多 max_rounds 轮)。
用 schema 校验当兜底,
后续可以把各阶段的启发式 critic 也补成 Python 版。
"""
from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import TypeVar

from pydantic import BaseModel, ValidationError

from ..models import ProviderEntry
from ..providers import ProviderError, generate_json

T = TypeVar("T", bound=BaseModel)

# 事件回调：(type, message) → None；用于把进度推给 SSE / 日志
Emit = Callable[[str, str], Awaitable[None] | None]


async def run_json_agent(
    *,
    llm: ProviderEntry,
    model: type[T],
    system: str,
    build_user: Callable[[list[str]], str],
    max_rounds: int = 3,
    emit: Emit | None = None,
    name: str = "agent",
) -> T:
    revision_notes: list[str] = []
    last_err: Exception | None = None
    # 首轮低温（稳），失败重试时逐轮升温，强制换一个采样逃出可复现的坏输出。
    temperatures = [0.3, 0.7, 1.0]
    for round_idx in range(max_rounds):
        user = build_user(revision_notes)
        temperature = temperatures[min(round_idx, len(temperatures) - 1)]
        try:
            raw = await generate_json(llm, system=system, user=user, temperature=temperature)
            return model.model_validate(raw)
        except ValidationError as e:
            last_err = e
            revision_notes = [
                "上一版输出不满足 schema，请严格按 JSON Schema 修正以下问题：\n"
                + "\n".join(f"- {err.get('loc')}: {err.get('msg')}" for err in e.errors()[:8])
            ]
        except ProviderError as e:
            # 空内容 / 非法 JSON / 网络问题 → 重试，并提醒只回合法 JSON
            last_err = e
            revision_notes = ["你上次没有返回合法 JSON。请只输出一个合法的 JSON 对象，不要任何解释文字或 ``` 代码围栏。"]
        if emit:
            res = emit("agent.retry", f"{name} 第 {round_idx + 2} 轮重试（{type(last_err).__name__}）")
            if res is not None:
                await res
    raise RuntimeError(f"{name} 连续 {max_rounds} 轮失败: {last_err}")
