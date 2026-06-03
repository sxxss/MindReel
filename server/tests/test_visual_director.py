"""分镜「结构 JSON + HTML 分隔块」输出协议的拼装解析。

关键诉求：HTML 里随便有双引号/换行/反斜杠，都不能影响解析——因为 HTML 不进 JSON。
"""
import pytest

from app.agents.visual_director import _props_valid, parse_chapter_payload
from app.providers import ProviderError

_STRUCT = (
    '```json\n'
    '{"scenes":[{"sceneId":"sc1","title":"开场","steps":['
    '{"id":"s1","caption":"引入"},{"id":"s2","caption":"演示"}],'
    '"shots":[{"id":"sh1","beatRefs":["b1"],"anchorTimeMs":0,"durationMs":3000,"camera":"focus",'
    '"animationOps":[{"id":"a1","kind":"enter","targetRef":"s1","ease":"easeInOut","durationMs":600}]}]}]}\n'
    '```\n'
)


def test_assembles_scene_from_structure_and_html_blocks():
    # HTML 里故意塞双引号、真实换行、反斜杠——这些以前会把 JSON 搞崩
    payload = _STRUCT + (
        '@@@HTML:s1\n'
        '<div style="width:100%;\n  height:100%" class="hs-panel">第一屏 \\ "引号" 都没问题</div>\n'
        '@@@HTML:s2\n'
        "<div style='color:var(--cyan)'>第二屏</div>\n"
    )
    scenes = parse_chapter_payload(payload, "ch1")
    assert len(scenes) == 1
    sc = scenes[0]
    assert sc.chapterId == "ch1" and sc.templateId == "HtmlSlide"
    assert _props_valid(sc.props)                      # 拼出来的 props 合法
    assert sc.props["title"] == "开场"
    htmls = [s["html"] for s in sc.props["steps"]]
    assert len(htmls) == 2
    assert '"引号"' in htmls[0] and "\n" in htmls[0]   # 引号与换行原样保留
    # shot id 被规范化成合法 nanoid（模型给的 sh1 太短，会被重发），时长被钳正 >0
    import re
    assert re.fullmatch(r"[A-Za-z0-9_-]{6,64}", sc.shots[0].id)
    assert sc.shots[0].durationMs > 0
    assert all(op.durationMs > 0 for op in sc.shots[0].animationOps)


def test_html_block_with_code_fence_is_unwrapped():
    payload = _STRUCT.replace('{"id":"s2","caption":"演示"}', "") + (
        '@@@HTML:s1\n```html\n<div>带围栏</div>\n```\n'
    )
    # 上面把 s2 从 steps 去掉了（替换不完整会破坏 JSON），改用最简单的单 step 结构
    payload = (
        '{"scenes":[{"sceneId":"sc1","steps":[{"id":"s1"}],'
        '"shots":[{"id":"sh1","beatRefs":["b1"],"anchorTimeMs":0,"durationMs":2000,"camera":"focus",'
        '"animationOps":[{"id":"a1","kind":"enter","targetRef":"s1","ease":"easeInOut","durationMs":600}]}]}]}\n'
        '@@@HTML:s1\n```html\n<div>带围栏</div>\n```\n'
    )
    scenes = parse_chapter_payload(payload, "ch1")
    assert scenes[0].props["steps"][0]["html"] == "<div>带围栏</div>"


def test_normalizes_bad_ids_and_zero_durations():
    import re
    payload = (
        '{"scenes":[{"sceneId":"sc1","steps":[{"id":"s1"}],'    # sc1 太短(<6) → 应重发
        '"shots":[{"id":"x","beatRefs":["b1xxxx"],"anchorTimeMs":0,"durationMs":0,"camera":"focus",'
        '"animationOps":[{"id":"a","kind":"enter","targetRef":"s1","ease":"easeInOut","durationMs":0}]}]}]}\n'
        '@@@HTML:s1\n<div>x</div>\n'
    )
    sc = parse_chapter_payload(payload, "ch1")[0]
    assert re.fullmatch(r"[A-Za-z0-9_-]{6,64}", sc.sceneId)
    assert re.fullmatch(r"[A-Za-z0-9_-]{6,64}", sc.shots[0].id)
    assert sc.shots[0].durationMs >= 1
    assert sc.shots[0].animationOps[0].durationMs >= 1


def test_missing_html_block_raises():
    # 结构里有 s1，但没给 @@@HTML:s1 块 → 抛错（上层据此重试/兜底）
    payload = (
        '{"scenes":[{"sceneId":"sc1","steps":[{"id":"s1"}],'
        '"shots":[{"id":"sh1","beatRefs":["b1"],"anchorTimeMs":0,"durationMs":2000,"camera":"focus",'
        '"animationOps":[{"id":"a1","kind":"enter","targetRef":"s1","ease":"easeInOut","durationMs":600}]}]}]}\n'
    )
    with pytest.raises(ProviderError):
        parse_chapter_payload(payload, "ch1")
