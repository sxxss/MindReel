"""visual-director agent —— 把每章旁白编排成一组 HtmlSlide 分镜。

核心三件事：
1. 域感知可视化：按 project.topic 推断内容域，注入该领域专用的画面模式。
2. 按章【顺序】生成：每次只产出一章的 scene（小输出更稳，避免一次性生成全片被截断）。
3. HtmlSlide props 兜底修复：模型偶尔漏 steps / 写非法 props，单个坏场景不应拖垮整片。

最后用一个确定性 critic 校验章序、beat 覆盖、shot 时序与画面密度。
"""
from __future__ import annotations

import json
import math
import re
from typing import Any, Optional

from pydantic import BaseModel, ValidationError, field_validator

from ..models import (
    AnimationOpKind,
    Curriculum,
    Knowledge,
    Project,
    ProviderEntry,
    SceneSpec,
    Script,
    ScriptSegment,
    Shot,
)
from .prompting import build_system_prompt, with_revision_instructions
from ..providers import ProviderError, generate_json
from .runner import Emit

ANIMATION_OP_KINDS = ["enter", "exit", "move", "morph", "highlight", "trace", "annotate"]


# ── HtmlSlide props 模型（用于生成 schema 提示 + 校验/修复）──────────────────────
class HtmlStep(BaseModel):
    model_config = {"extra": "forbid"}
    html: str
    caption: Optional[str] = None

    @field_validator("html")
    @classmethod
    def _html_nonempty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("html 不能为空")
        return v


class HtmlSlideProps(BaseModel):
    model_config = {"extra": "forbid"}
    title: Optional[str] = None
    steps: list[HtmlStep]

    @field_validator("steps")
    @classmethod
    def _steps_bounds(cls, v: list[HtmlStep]) -> list[HtmlStep]:
        if not (1 <= len(v) <= 12):
            raise ValueError("steps 数量必须在 1-12 之间")
        return v


# ── 草稿 scene 模型（templateId 放宽成普通字符串）──────────
class DraftScene(BaseModel):
    model_config = {"extra": "forbid"}
    chapterId: str
    sceneId: str
    templateId: str
    props: dict[str, Any]
    shots: list[Shot]


class ChapterSceneOutput(BaseModel):
    """单章输出包成对象 {scenes:[...]}：json_object 模式下顶层必须是对象。"""
    model_config = {"extra": "forbid"}
    scenes: list[DraftScene]


# ── 主题域检测 ────────────────────────────────────────────────────────────────
DOMAIN_KEYWORDS: dict[str, list[str]] = {
    "algorithm": ["算法", "排序", "搜索", "指针", "递归", "动态规划", "贪心", "树", "图", "堆", "哈希",
                  "复杂度", "数据结构", "队列", "栈", "链表", "二分", "回溯", "双指针", "滑动窗口"],
    "network": ["tcp", "http", "网络", "协议", "握手", "路由", "ip", "dns", "cdn", "数据包", "socket",
                "带宽", "延迟", "osi", "报文", "三次握手", "四次挥手"],
    "math": ["数学", "公式", "证明", "微积分", "导数", "积分", "矩阵", "线代", "概率", "统计", "傅里叶",
             "拉普拉斯", "泰勒", "函数", "集合", "数论", "密码学"],
    "physics": ["物理", "量子", "相对论", "波", "电磁", "热力学", "力", "能量", "黑洞", "宇宙", "天文",
                "光子", "粒子", "引力", "时空", "暗物质"],
    "biology": ["生物", "细胞", "基因", "dna", "进化", "神经", "大脑", "医学", "病毒", "免疫", "蛋白质",
                "光合", "生态", "器官"],
    "history": ["历史", "朝代", "战争", "文明", "古代", "近代", "革命", "事件", "帝国", "人物", "年代", "时代"],
    "economics": ["经济", "金融", "市场", "供需", "增长", "gdp", "通胀", "利率", "股票", "贸易", "商业",
                  "商业模式", "创业", "货币"],
    "cs_system": ["操作系统", "数据库", "编译器", "分布式", "架构", "内存", "进程", "线程", "并发", "缓存",
                  "存储", "文件系统", "虚拟机", "容器", "微服务"],
    "concept": ["哲学", "心理", "认知", "社会", "方法论", "思维", "逻辑", "意识", "语言", "文化", "教育", "设计"],
}


def detect_visual_domain(topic: str) -> str:
    lower = topic.lower()
    best, best_score = "concept", 0
    for domain, keywords in DOMAIN_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw.lower() in lower)
        if score > best_score:
            best, best_score = domain, score
    return best


DOMAIN_VISUAL_PATTERNS: dict[str, str] = {
    "algorithm":
        "【算法域可视化】本章是算法/数据结构主题，使用：①左 45% 放伪代码或代码片段（.hs-code，当前执行行加 .line.active 高亮）；②右 55% 用 .hs-cell 方块排成数组/树/图，活跃节点加 .active；③下方用 .hs-badge 显示实时计算值（sum/i/j 等变量名+数值）；④每步 step 严格对应一行代码执行或一次指针移动，让观众能追踪每一步的状态变化。",
    "network":
        "【网络协议域可视化】本章是网络/协议主题，使用时序图样式：①纵向排列 Client（左）/ Server（右）两列，用竖线分隔；②横向「数据包行」：用 div 方块表示包（背景色区分 SYN/ACK/FIN 等），加 →/← 箭头（CSS border + transform: rotate）表示发送方向；③每步只显示本步新增的包交互，已完成的包保持灰色（opacity:0.4）；④右侧状态栏用 .hs-badge 显示连接状态（如 ESTABLISHED）；⑤时序图用 position:absolute 精确定位，不要用普通 flex 布局。",
    "math":
        "【数学域可视化】本章是数学/公式主题，使用：①中央展示大字号公式（font-size:60-80px, font-family: var(--font-mono), color:var(--cyan)），用 TeX 符号风格书写；②左侧或下方放几何图形——用 CSS border/transform/border-radius 画圆、三角形、坐标轴、向量箭头；③每步推导一个变换或步骤，用 →（⟹）连接前后公式；④用 .hs-badge.ok 高亮最终结论；⑤坐标系：用两条 div 线（position:absolute, 1-2px 宽）画 x/y 轴，再用小圆 div 标点。",
    "physics":
        "【物理域可视化】本章是物理/天文主题，使用：①用 CSS radial-gradient / border-radius:50% 画天体、粒子、波；②用绝对定位 div + CSS border 画力向量箭头（方向用 transform:rotate 控制）；③粒子/原子：用多个小圆 div（不同颜色）按轨道或排列排布；④时空弯曲：用 radial-gradient 模拟引力势井；⑤能量/波：用 linear-gradient 或重复 background 模拟波形；⑥禁止用代码块/数组方块，这是错误的可视化形式。",
    "biology":
        "【生物域可视化】本章是生物/医学主题，使用：①细胞/器官：用 border-radius:50% 的圆形 div 表示细胞，嵌套 div 表示细胞核/细胞器，用颜色区分类型；②流程/过程：垂直步骤链（每步一个 .hs-panel 卡片，用箭头连接），每步展示该阶段的关键变化；③对比：两列 .hs-panel 并排，分别显示「正常」vs「异常」或「有/无」对比；④标注：在结构图上加绝对定位的文字标签 + 连线到对应结构；⑤禁止用代码块。",
    "history":
        "【历史/叙事域可视化】本章是历史/叙事主题，使用横向时间轴：①一条横向线段（position:absolute, height:3px, background:var(--cyan)）贯穿中部；②沿线按时间顺序排列圆形事件节点（border-radius:50%, border:2px solid var(--cyan)），当前步骤节点放大并用活跃色；③节点上方/下方轮流放事件卡片（.hs-panel），含年份(大字)+事件名+一句说明；④每步 step 仅高亮一个节点（其余 opacity:0.4），让观众跟着视线走；⑤禁止用代码块。",
    "economics":
        "【经济/商业域可视化】本章是经济/商业主题，使用：①数据对比：2-4 个 .hs-panel 横向并排，每个面板含指标名+大数值+变化趋势（↑↓箭头，颜色区分正负）；②流程：横向步骤链（flexbox 排列 .hs-chip 节点），用 → 箭头连接；③供需图：用 CSS 画坐标系 + 两条折线 div（表示供给/需求曲线，用 position+transform）；④对比表：左右两列，左边「旧模式」用 .hs-badge.warn，右边「新模式」用 .hs-badge.ok；⑤禁止用代码块/数组方块。",
    "cs_system":
        "【系统/架构域可视化】本章是操作系统/数据库/分布式主题，使用：①架构图：用矩形 div（.hs-panel）表示各层/组件，用箭头线段（position:absolute + CSS border）连接，颜色区分层次；②内存/存储：用水平或垂直的分格 div（类似 .hs-cell 但可以不等宽）表示地址空间/页表/缓冲区，当前操作格高亮；③时序：参照网络域的时序图样式，展示进程/线程交互；④状态机：圆形 div 表示状态，箭头标事件，当前状态用 .active 边框；⑤代码块用于展示系统调用、伪代码或关键 API，不是必须的。",
    "concept":
        "【通用概念域可视化】本章是概念/方法论主题，使用：①核心概念放中央大字（56px, color:var(--cyan)），向外辐射 3-5 个关键词（绝对定位，连线指向中心）；②对比：两列 .hs-panel，左「误区」右「正解」，用 .hs-badge.warn/.hs-badge.ok 区分；③层次/因果：上下或左右箭头链（每个 .hs-chip 代表一层，大箭头连接）；④四象限：两轴交叉分 4 个区域，每区放一个概念标签；⑤禁止生硬套用代码块，若主题本身不涉及代码则不要出现。",
}

# ── 通用规则（所有域共享）──────────────────────────────────────────────────────
HTMLSLIDE_UNIVERSAL_RULES = [
    "【输出】本章产出 1-2 个 scene，templateId 一律为 HtmlSlide；每个 beat 必须被某个 shot 覆盖且只覆盖一次，shot.beatRefs 只能引用本章 estimatedSchedule 里的 beatId。",
    "【shot/动画】每个 shot 至少一个 animationOp（targetRef 指向画面元素或 beat 关键词）；shot 按 estimatedSchedule 的 anchorTimeMs 单调递增排布；animationOp.kind 只能是 "
    + " / ".join(ANIMATION_OP_KINDS)
    + "（严禁 zoom/scale/fade 等）。",
    "【steps 跟着旁白走，节奏慢】steps 数量≈本章 beat 数（一句旁白=一步），画面切换不要比旁白快。每步至少停 4-5 秒，宁少不多。",
    "【严禁把旁白写进画面】系统会单独渲染字幕条，html 里绝对不要出现旁白原句/整句解说（如「你看，三步之后…」这类口语句子）。画面里只放：标题、关键词标签、数值、状态名、图示元素。caption 字段只写一句简短提示，不要把它再画进 html。",
    "【绝不重叠】所有元素要留足间距、互不重叠：时序图里客户端列与服务器列要拉开（如 left:18% 与 left:72%），数据包标签放在两列之间的连线上方、不要压在节点圆圈或状态徽标上；状态徽标放节点下方并留 20px 以上间距。宁可元素少一点，也不要挤在一起糊成一团。",
    "【每步铺满 + 深色底 + 鲜艳元素】每步占满 1920×1080，不留大片空白；背景深色（var(--bg)，不要整屏浅色），靠 accent 彩色元素提亮——面板/方块/徽章/边框上色（cyan/orange/pink/green），每屏 2-3 种 accent 色，活跃元素加 .active。",
    "【不要溢出一屏】所有内容必须装进可视区（标题区下方、字幕区上方约 1792×800 的范围内），宁可少放也不要纵向堆太多导致超出被裁。单步元素控制在 5-7 个以内；代码块最多展示 10-12 行；字号别一味调大到撑爆。",
    "【布局多样化】同一视频里场景必须使用不同布局，不能重复。根据内容在以下中选：①左内容右可视化（各 50%）②横向多列对比 ③顶部大标题+下方步骤卡片 ④全屏结构图。",
    "【自包含 + 工具类】step.html 只用内联 style 或 var(--ink)/--muted/--cyan/--orange/--pink/--green/--grid/--bg/--font-mono，及工具类 .hs-panel .hs-cell[.active] .hs-code .line[.active] .hs-badge[.ok/.warn] .hs-chip；大字号（标题 48-60px、正文 28-34px），用 px 少用 rem。",
    "【逐元素入场动画】每步至少 3 个主要元素加动画类：.hs-enter（淡入+上移）、.hs-pop（缩放）、.hs-slide-left（横滑）、.hs-glow（发光，适合结论）。用 style=\"--hs-delay:0\" / 0.15 / 0.3 / 0.45 做错位入场。",
    "审美红线：不要紫粉渐变背景、不要 emoji 堆砌、不要假图标，克制专业、有信息密度。",
]


def _html_slide_schema_hint() -> str:
    return "HtmlSlide 的 props JSON Schema：\n" + json.dumps(
        HtmlSlideProps.model_json_schema(), ensure_ascii=False, indent=2
    )


# ── 旁白时间估算 ──────────────────────────────
def _count_readable_chars(text: str) -> int:
    return sum(1 for ch in text if ch.strip())


def _estimate_beat_duration_ms(text: str, pause_after_ms: int) -> int:
    return max(1000, math.ceil(_count_readable_chars(text) / 4 * 1000) + pause_after_ms)


def estimate_beat_schedule(segment: ScriptSegment) -> list[dict[str, Any]]:
    anchor = 0
    out: list[dict[str, Any]] = []
    for beat in segment.beats:
        dur = _estimate_beat_duration_ms(beat.text, beat.pauseAfterMs)
        out.append({
            "beatId": beat.id,
            "text": beat.text,
            "notes": beat.notes,
            "emphasisTerms": beat.emphasisTerms,
            "anchorTimeMs": anchor,
            "estimatedDurationMs": dur,
        })
        anchor += dur
    return out


# ── 提示词构建 ────────────────────────────────────────────────────────────────
def build_chapter_system_prompt(chapter, topic: str) -> str:
    domain = detect_visual_domain(topic)
    constraints = [
        f'本次只为章节「{chapter.id}」（{chapter.title}）产出 scene；输出一个 JSON 对象 '
        f'{{"scenes": [...]}}，每个元素 chapterId 必须等于「{chapter.id}」、templateId 必须是 HtmlSlide。',
    ]
    if chapter.kind == "hook":
        constraints.append("这是整支视频开场：第一页做成标题/引入页（醒目大标题 + 一句钩子/悬念），再进入正题。")
    constraints.append(DOMAIN_VISUAL_PATTERNS[domain])
    constraints.extend(HTMLSLIDE_UNIVERSAL_RULES)
    constraints.append(_html_slide_schema_hint())
    return build_system_prompt(
        role="你是一位信息可视化导演。你把一章旁白编排成一组用 HtmlSlide 现写的、画面勤变的分镜（每个 scene 是一页自包含 HTML 演示）。",
        schema=ChapterSceneOutput,
        constraints=constraints,
    )


def build_chapter_user_prompt(project: Project, chapter, segment: ScriptSegment) -> str:
    return "\n\n".join([
        '只输出一个 JSON 对象 {"scenes": [...]}（scenes 是本章 1-2 个 HtmlSlide），不要解释。',
        f"项目：{project.title} | 主题：{project.topic} | 受众：{project.audience}",
        "本章 beat 文本里已含具体数值/例子，请沿用；全片用同一个例子，不要换数字。",
        "本章：\n" + json.dumps({
            "id": chapter.id,
            "title": chapter.title,
            "learningGoal": chapter.learningGoal,
            "kind": chapter.kind,
            "expectedSeconds": chapter.expectedSeconds,
            "estimatedSchedule": estimate_beat_schedule(segment),
        }, ensure_ascii=False, indent=2),
    ])


# ── HtmlSlide props 兜底修复 ──────────────────────
def _escape_html(s: str) -> str:
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;"))


def _props_valid(props: dict[str, Any]) -> bool:
    try:
        HtmlSlideProps.model_validate(props)
        return True
    except ValidationError:
        return False


def repair_html_slide_props(
    scene: DraftScene,
    beat_text_by_id: dict[str, str],
    fallback_beats: list[dict[str, str]],
) -> DraftScene:
    if scene.templateId != "HtmlSlide" or _props_valid(scene.props):
        return scene

    raw = scene.props
    raw_steps = raw.get("steps") if isinstance(raw.get("steps"), list) else []
    steps: list[dict[str, Any]] = []
    for s in raw_steps or []:
        if isinstance(s, dict) and isinstance(s.get("html"), str) and s["html"].strip():
            caption = s.get("caption")
            step = {"html": s["html"]}
            if isinstance(caption, str) and caption.strip():
                step["caption"] = caption.strip()
            steps.append(step)

    if not steps:
        ref_ids = [b for shot in scene.shots for b in shot.beatRefs]
        beats = ([{"id": i, "text": beat_text_by_id.get(i, "")} for i in ref_ids]
                 if ref_ids else fallback_beats)
        for idx, b in enumerate(beats):
            if not b["text"].strip():
                continue
            steps.append({
                "html": (
                    '<div class="hs-panel hs-enter" style="max-width:1500px;padding:64px 72px;'
                    'text-align:center;display:flex;flex-direction:column;align-items:center;gap:28px">'
                    f'<span class="hs-badge" style="font-size:26px">{idx + 1}</span>'
                    '<p style="font-size:46px;line-height:1.55;color:var(--ink);font-weight:600">'
                    f'{_escape_html(b["text"])}</p></div>'
                ),
                "caption": b["text"][:40],
            })

    if not steps:
        steps = [{
            "html": ('<div class="hs-panel hs-enter" style="padding:56px">'
                     f'<p style="font-size:40px;color:var(--ink)">{_escape_html(scene.chapterId)}</p></div>'),
        }]

    title = raw.get("title")
    repaired: dict[str, Any] = {"steps": steps[:12]}
    if isinstance(title, str) and title.strip():
        repaired = {"title": title.strip(), "steps": steps[:12]}
    return scene.model_copy(update={"props": repaired})


# ── 跨章后处理 ────────────────────────────────────────────────────────────────
def dedupe_beat_coverage(scenes: list[DraftScene]) -> list[DraftScene]:
    """同一 beat 被多个 shot 引用时只保留首次出现，空 shot/空 scene 丢弃。"""
    seen: set[str] = set()
    out: list[DraftScene] = []
    for scene in scenes:
        new_shots = []
        for shot in scene.shots:
            refs = [b for b in shot.beatRefs if b not in seen]
            for b in refs:
                seen.add(b)
            if refs:
                new_shots.append(shot.model_copy(update={"beatRefs": refs}))
        if new_shots:
            out.append(scene.model_copy(update={"shots": new_shots}))
    return out


def ensure_unique_scene_ids(scenes: list[DraftScene]) -> list[DraftScene]:
    seen: set[str] = set()
    out: list[DraftScene] = []
    for scene in scenes:
        sid = scene.sceneId
        suffix = 2
        while sid in seen:
            sid = f"{scene.sceneId}_{suffix}"[:64]
            suffix += 1
        seen.add(sid)
        out.append(scene if sid == scene.sceneId else scene.model_copy(update={"sceneId": sid}))
    return out


# ── 确定性 critic（章序 / beat 覆盖 / 时序）──────────────────────────────────────
def review_scenes(scenes: list[DraftScene], curriculum: Curriculum,
                  script: Script) -> list[str]:
    issues: list[str] = []
    segments_by_chapter = {seg.chapterId: seg for seg in script.segments}
    expected_ids = [c.id for c in curriculum.chapters]

    collapsed: list[str] = []
    for scene in scenes:
        if not collapsed or collapsed[-1] != scene.chapterId:
            collapsed.append(scene.chapterId)
    if collapsed != expected_ids:
        issues.append("每个 chapter 至少要有一个 scene；同一 chapter 的多个 scene 必须连续，章节顺序要与 curriculum.chapters 完全一致。")

    covered_by_chapter: dict[str, set[str]] = {}
    seen_by_chapter: dict[str, set[str]] = {}
    for scene in scenes:
        if scene.templateId != "HtmlSlide":
            issues.append(f"scene {scene.sceneId} 使用了非 HtmlSlide 的 templateId「{scene.templateId}」。")
        elif not _props_valid(scene.props):
            issues.append(f"scene {scene.sceneId} 的 HtmlSlide props 不合法（steps 缺失或为空）。")

        seg = segments_by_chapter.get(scene.chapterId)
        if seg is None:
            issues.append(f"scene {scene.sceneId} 引用了没有脚本 segment 的 chapter「{scene.chapterId}」。")
        else:
            allowed = {b.id for b in seg.beats}
            covered = covered_by_chapter.setdefault(scene.chapterId, set())
            seen = seen_by_chapter.setdefault(scene.chapterId, set())
            for shot in scene.shots:
                for ref in shot.beatRefs:
                    if ref not in allowed:
                        issues.append(f"scene {scene.sceneId} 的 shot {shot.id} 引用了本章外的 beat「{ref}」。")
                        continue
                    if ref in seen:
                        issues.append(f"chapter {scene.chapterId} 的 beat「{ref}」被多个 shot/scene 重复覆盖。")
                    seen.add(ref)
                    if shot.animationOps:
                        covered.add(ref)

        for i in range(1, len(scene.shots)):
            prev, cur = scene.shots[i - 1], scene.shots[i]
            if cur.anchorTimeMs < prev.anchorTimeMs:
                issues.append(f"scene {scene.sceneId} 的 shot anchorTimeMs 必须单调递增。")
            if cur.anchorTimeMs < prev.anchorTimeMs + prev.durationMs:
                issues.append(f"scene {scene.sceneId} 的 shot {prev.id} 与 {cur.id} 时间重叠。")

    for chapter in curriculum.chapters:
        seg = segments_by_chapter.get(chapter.id)
        if seg is None:
            continue
        covered = covered_by_chapter.get(chapter.id, set())
        missing = [b.id for b in seg.beats if b.id not in covered]
        if missing:
            issues.append(f"chapter {chapter.id} 未覆盖 beat：{' / '.join(missing)}。")

    return issues


# ── 单章生成（带漏-steps 重试 + 兜底）──────────────────────────────────────────
async def _generate_chapter_scenes(
    project: Project, chapter, segment: ScriptSegment, llm: ProviderEntry,
    revision_notes: list[str], emit: Emit | None,
) -> list[DraftScene]:
    system = build_chapter_system_prompt(chapter, project.topic)
    base_user = build_chapter_user_prompt(project, chapter, segment)

    async def call_llm(extra_note: str, temperature: float = 0.3) -> list[DraftScene]:
        user = with_revision_instructions(
            f"{base_user}\n\n{extra_note}" if extra_note else base_user, revision_notes
        )
        raw = await generate_json(llm, system=system, user=user, temperature=temperature)
        parsed = ChapterSceneOutput.model_validate(raw)
        return [s.model_copy(update={"chapterId": chapter.id}) for s in parsed.scenes]

    def has_invalid(scenes: list[DraftScene]) -> bool:
        return any(s.templateId == "HtmlSlide" and not _props_valid(s.props) for s in scenes)

    try:
        scenes = await call_llm("")
    except (ValidationError, ProviderError):
        # 整个对象都没解析出来 → 退化为「用本章 beat 合成最小可用场景」
        scenes = [_fallback_scene(chapter, segment)]

    if has_invalid(scenes):
        if emit:
            res = emit("agent.retry", f"章节「{chapter.id}」HtmlSlide props 非法，重试 1 次后兜底")
            if res is not None:
                await res
        try:
            retried = await call_llm(
                '【重要修正】上一次有 scene 的 HtmlSlide props 不合法。务必保证每个 scene 的 props 形如 '
                '{"title"?:"...","steps":[{"html":"<...>","caption"?:"..."}, ...]}：'
                "steps 必填、至少 1 个，每个 step 的 html 是非空字符串。不要省略 steps 字段。",
                temperature=0.7,
            )
            if not has_invalid(retried) or len(retried) >= len(scenes):
                scenes = retried
        except (ValidationError, ProviderError):
            pass

    beat_text_by_id = {b.id: b.text for b in segment.beats}
    fallback_beats = [{"id": b.id, "text": b.text} for b in segment.beats]
    return [repair_html_slide_props(s, beat_text_by_id, fallback_beats) for s in scenes]


def _fallback_scene(chapter, segment: ScriptSegment) -> DraftScene:
    """LLM 整体失败时，用本章 beat 拼一个能过 schema 的最小场景。"""
    anchor = 0
    shots = []
    for i, beat in enumerate(segment.beats):
        dur = _estimate_beat_duration_ms(beat.text, beat.pauseAfterMs)
        shots.append(Shot(
            id=f"{chapter.id}-shot{i}"[:64],
            beatRefs=[beat.id],
            anchorTimeMs=anchor,
            durationMs=dur,
            camera="focus",
            animationOps=[{
                "id": f"{chapter.id}-anim{i}"[:64], "kind": "enter",
                "targetRef": f"step{i}", "ease": "easeInOut", "durationMs": 600,
            }],
        ))
        anchor += dur
    return DraftScene(
        chapterId=chapter.id, sceneId=f"{chapter.id}-scene"[:64],
        templateId="HtmlSlide", props={"steps": []}, shots=shots or [Shot(
            id=f"{chapter.id}-shot0"[:64], beatRefs=[segment.beats[0].id] if segment.beats else [],
            anchorTimeMs=0, durationMs=2000, camera="focus",
            animationOps=[{"id": f"{chapter.id}-a0", "kind": "enter", "targetRef": "step0",
                           "ease": "easeInOut", "durationMs": 600}],
        )],
    )


# ── 编排入口 ──────────────────────────────────────────────────────────────────
async def run_visual_director(
    project: Project, knowledge: Knowledge, curriculum: Curriculum, script: Script,
    llm: ProviderEntry, emit: Emit | None = None, max_rounds: int = 1,
) -> list[SceneSpec]:
    segments_by_chapter = {seg.chapterId: seg for seg in script.segments}
    revision_notes: list[str] = []
    last_issues: list[str] = []

    for _round in range(max_rounds + 1):
        per_chapter: list[DraftScene] = []
        for chapter in curriculum.chapters:
            seg = segments_by_chapter.get(chapter.id)
            if seg is None:
                raise RuntimeError(f"缺少章节 {chapter.id} 的脚本 segment")
            per_chapter.extend(
                await _generate_chapter_scenes(project, chapter, seg, llm, revision_notes, emit)
            )

        scenes = ensure_unique_scene_ids(dedupe_beat_coverage(per_chapter))
        issues = review_scenes(scenes, curriculum, script)
        if not issues:
            # 草稿 → 正式 SceneSpec（templateId 此时必为 HtmlSlide）
            return [SceneSpec.model_validate(s.model_dump()) for s in scenes]

        last_issues = issues
        revision_notes = ["请局部重写 SceneSpec，并修复这些问题：\n" + "\n".join(f"- {i}" for i in issues)]

    raise RuntimeError("visual-director 未通过 critic：\n" + "\n".join(last_issues))
