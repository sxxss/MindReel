"""research agent —— 把资料压成可教学的事实清单。"""
from __future__ import annotations

from ..models import Knowledge, Project, ProviderEntry, SourceDocument
from .prompting import build_system_prompt, with_revision_instructions
from .runner import Emit, run_json_agent

_CONSTRAINTS = [
    "facts 至少 8 条，terms 至少 5 条，misconceptions 至少 2 条；资料充足时尽量多覆盖关键事实。",
    "每条 fact.claim 控制在 8-50 个字符，要写成有主语、有机制或有结论的具体陈述，避免“很重要/有帮助”这类空话。",
    "不要复述资料原文，要提炼成可教学、可验证的陈述句。",
    "引用资料的 facts 必须填写 sourceIds；没有可靠依据时 evidence 必须写 LLM-prior，且 sourceIds 为空数组。",
    "没有可靠依据时不准伪造引用来源。",
    "禁止输出空数组；资料不足时也要补足最少条数，但必须显式标注 LLM-prior。",
    "misconceptions 必须写成会被纠正的常见误解，而不是普通定义或总结。",
]


def _user(project: Project, sources: list[SourceDocument]) -> str:
    if not sources:
        src = "资料为空。请结合主题与常识补足最少条数，但所有无可靠依据的 fact 都必须 evidence='LLM-prior' 且 sourceIds=[]。"
    else:
        src = "资料：\n" + "\n\n".join(
            f"{i + 1}. id={s.id}\n标题：{s.title}\n正文：{s.body}" for i, s in enumerate(sources)
        )
    return "\n\n".join([
        "请输出一份可教学事实清单，供后续课程与讲稿 agent 使用。",
        f"项目标题：{project.title}",
        f"主题：{project.topic}",
        f"受众：{project.audience}",
        src,
    ])


async def run_research(project: Project, sources: list[SourceDocument], llm: ProviderEntry,
                       emit: Emit | None = None) -> Knowledge:
    system = build_system_prompt(role="你是一位严谨的领域研究员，负责把杂乱资料压缩成一份可教学的事实清单。",
                                 schema=Knowledge, constraints=_CONSTRAINTS)
    base = _user(project, sources)
    return await run_json_agent(
        llm=llm, model=Knowledge, system=system,
        build_user=lambda notes: with_revision_instructions(base, notes),
        emit=emit, name="research",
    )
