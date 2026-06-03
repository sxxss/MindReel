"""script agent —— 把大纲写成 beat 级旁白稿。"""
from __future__ import annotations

import json

from ..models import Curriculum, Knowledge, Project, ProviderEntry, Script
from .prompting import build_system_prompt, with_revision_instructions
from .runner import Emit, run_json_agent


def _constraints(target_seconds: int) -> list[str]:
    return [
        "segments 必须和 curriculum.chapters 一一对应，顺序一致。",
        f"整体节奏要贴近 {target_seconds} 秒，每个 beat 估算时长控制在 3-12 秒。",
        "每章拆成多个 ScriptBeat，每个 beat 写 1 句口语化中文、估算 4-6 秒，按内容自然切分；不要一个 beat 讲十几秒，也不要硬切成大量碎句。画面的频繁变化靠每个 beat 内部的视觉小步实现，不靠把旁白切碎。",
        "可以自然使用“那么… / 我们来看一下…”这类过渡，但避免书面化长句。",
        "核心术语第一次出现时，要用括号补一小段口语化解释。",
        "【贯穿一个具体例子】只要主题可举例演示，就必须在开头确定一个具体输入（如数组 [2,7,11,15]、目标 9），并在全片只用这一个例子、绝不中途换数字。",
        "【口述具体演算】涉及过程的章节要逐个 beat 说出真实数值与判断，例如「2加15等于17，比9大，右指针往左挪一格」；不要只讲抽象规则。",
        "【例子要能体现过程】挑的例子必须需要【多步】才能得到答案，绝不选第一步就出结果的平凡例子。",
        "beat.text 里不准写舞台指示；舞台指示只能写进 beat.notes。",
        "章节结束前的最后一个 beat pauseAfterMs 至少 400，章节内其它 beat 保持在 0-250。",
        "emphasisTerms 必须从当前 beat 中抽出真正需要画面突出的关键词。",
    ]


def _user(project: Project, knowledge: Knowledge, curriculum: Curriculum) -> str:
    return "\n\n".join([
        "请输出给 TTS 与视觉 agent 共用的脚本中间件，而不是普通讲稿。",
        f"项目：{project.title}",
        f"主题：{project.topic}",
        f"目标时长：{project.durationTargetSeconds} 秒",
        "请优先沿用 curriculum 的章目标与章节顺序，不要额外扩写新章节。",
        "旁白必须建立在下面 knowledge 的具体事实、术语和误区之上：每个 beat 都要落到主题特有的对象、步骤或结论，禁止只讲适用于任何主题的套话。",
        "尽量在合适的 beat 自然引用 knowledge.facts 里的具体结论，第一次出现术语时用括号补一句口语化解释；不同 beat 不要重复同一句话。",
        "knowledge：\n" + json.dumps(knowledge.model_dump(mode="json"), ensure_ascii=False, indent=2),
        "curriculum：\n" + json.dumps(curriculum.model_dump(mode="json"), ensure_ascii=False, indent=2),
    ])


async def run_script(project: Project, knowledge: Knowledge, curriculum: Curriculum,
                     llm: ProviderEntry, emit: Emit | None = None) -> Script:
    system = build_system_prompt(
        role="你是中文旁白编剧，要把课程大纲写成可口播、可配画面的 beat 级视频旁白稿。",
        schema=Script, constraints=_constraints(project.durationTargetSeconds),
    )
    base = _user(project, knowledge, curriculum)
    return await run_json_agent(
        llm=llm, model=Script, system=system,
        build_user=lambda notes: with_revision_instructions(base, notes),
        emit=emit, name="script",
    )
