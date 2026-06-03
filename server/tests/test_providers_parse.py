"""LLM 响应解析的健壮性：去围栏、救「写了两遍」、补空值、删拖尾逗号、拆数组。"""
import pytest

from app.providers import ProviderError, _balanced_spans, _parse_content, _repair_json


def test_plain_object():
    assert _parse_content('{"a": 1, "b": "x"}') == {"a": 1, "b": "x"}


def test_strips_code_fence():
    assert _parse_content('```json\n{"a": 1}\n```') == {"a": 1}


def test_unwraps_single_element_array():
    # response_format=json_object 下个别模型把对象包进单元素数组
    assert _parse_content('[{"a": 1}]') == {"a": 1}


def test_recovers_from_doubled_output():
    # 先吐一段坏 JSON，再用围栏重写一份完整的 —— 应取到后者
    raw = '{"a":,  broken...\n\n```json\n{"a": 1, "b": 2}\n```'
    assert _parse_content(raw) == {"a": 1, "b": 2}


def test_repairs_empty_numeric_value():
    # deepseek 高频：数值字段被吐成空值
    assert _parse_content('{"durationMs":, "x": 1}') == {"durationMs": 0, "x": 1}


def test_repairs_trailing_comma():
    assert _parse_content('{"a": 1, "b": 2,}') == {"a": 1, "b": 2}


def test_repair_does_not_touch_strings():
    # 字符串里的 `:,` / `,}` 不能被改动（HTML/CSS 里很常见）
    src = '{"html": "<div style=\\"x\\">a,</div>"}'
    assert _repair_json(src) == src


def test_balanced_spans_extracts_each_object():
    spans = _balanced_spans('noise {"a":1} more [1,2] tail')
    assert '{"a":1}' in spans
    assert "[1,2]" in spans


def test_empty_content_raises():
    with pytest.raises(ProviderError):
        _parse_content("   ")
