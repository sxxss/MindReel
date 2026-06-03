"""时间线求解器（确定性）：shot 时长 = 覆盖 beat 的真实语音时长之和，音画对齐。"""
from app.agents.timeline_solver import DEFAULT_SCENE_GAP_MS, solve_timeline
from app.models import (
    Chapter,
    Curriculum,
    Project,
    SceneSpec,
    Script,
    ScriptBeat,
    ScriptSegment,
    Shot,
    VoiceTrack,
)


def _project():
    return Project(id="p", title="t", topic="双指针", audience="初学者",
                   durationTargetSeconds=60, createdAt="x", updatedAt="x", status="active")


def _anim(i):
    return {"id": f"a{i}", "kind": "enter", "targetRef": f"e{i}", "ease": "easeInOut", "durationMs": 600}


def _build():
    curriculum = Curriculum(title="t", objective="o", chapters=[
        Chapter(id="ch1", title="开场", learningGoal="g", expectedSeconds=10, kind="hook"),
    ])
    script = Script(segments=[ScriptSegment(chapterId="ch1", beats=[
        ScriptBeat(id="b1", text="第一句", pauseAfterMs=0),
        ScriptBeat(id="b2", text="第二句", pauseAfterMs=200),
    ])])
    scene = SceneSpec(chapterId="ch1", sceneId="s1", templateId="HtmlSlide",
                      props={"steps": [{"html": "<div>x</div>"}]}, shots=[
        Shot(id="sh1", beatRefs=["b1"], anchorTimeMs=0, durationMs=600, camera="focus",
             animationOps=[_anim(1)]),
        Shot(id="sh2", beatRefs=["b2"], anchorTimeMs=0, durationMs=600, camera="focus",
             animationOps=[_anim(2)]),
    ])
    voice = VoiceTrack.model_validate({"cues": [
        {"beatId": "b1", "audioPath": "projects/p/audio/b1.mp3", "actualDurationMs": 2000,
         "provider": "tts", "voice": "v", "mimeType": "audio/mpeg"},
        {"beatId": "b2", "audioPath": "projects/p/audio/b2.mp3", "actualDurationMs": 3000,
         "provider": "tts", "voice": "v", "mimeType": "audio/mpeg"},
    ]})
    return _project(), curriculum, script, [scene], voice


def test_shot_duration_follows_real_voice_length():
    tl = solve_timeline(*_build())
    assert len(tl.scenes) == 1
    shots = tl.scenes[0].shots
    # shot1 覆盖 b1（2000ms，无停顿）→ 0..2000
    assert shots[0].startMs == 0
    assert shots[0].endMs == 2000
    # shot2 覆盖 b2（3000ms + 200 停顿）→ 紧接 shot1（中间有固定 pad）
    assert shots[1].endMs - shots[1].startMs == 3200


def test_subtitle_cues_align_to_beats():
    tl = solve_timeline(*_build())
    cues = [c for s in tl.scenes[0].shots for c in s.subtitleCues]
    assert [c.beatId for c in cues] == ["b1", "b2"]
    assert cues[0].endMs - cues[0].startMs == 2000  # 字幕时长 = 真实语音时长


def test_total_duration_and_drift_warning():
    tl = solve_timeline(*_build())
    # 末场景结束即总时长（最后没有尾部 gap 计入总时长）
    assert tl.durationMs == tl.scenes[-1].endMs
    # 实际 ~5.2s 远低于目标 60s → 应产生项目时长漂移告警
    assert any(w.code == "project-duration-drift" for w in tl.warnings)


def test_missing_voice_cue_raises():
    import pytest
    project, curriculum, script, scenes, voice = _build()
    voice.cues = voice.cues[:1]  # 删掉 b2 的配音
    with pytest.raises(ValueError):
        solve_timeline(project, curriculum, script, scenes, voice)


def test_scene_gap_constant_exposed():
    assert DEFAULT_SCENE_GAP_MS > 0
