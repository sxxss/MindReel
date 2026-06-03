"""流水线阶段映射与事件等级。"""
from app import pipeline
from app.pipeline import _level_for


def test_autopilot_runs_all_stages():
    assert pipeline.JOB_KIND_TO_STAGES["autopilot"] == pipeline.ALL_STAGES


def test_single_stage_kinds():
    assert pipeline.JOB_KIND_TO_STAGES["render"] == ["render"]
    assert pipeline.JOB_KIND_TO_STAGES["scene-spec"] == ["scene-spec"]
    assert pipeline.JOB_KIND_TO_STAGES["qa"] == []


def test_action_stage_to_internal():
    # 前端用 PipelineStage 名（knowledge/scenes），内部阶段名不同
    assert pipeline.ACTION_STAGE_TO_INTERNAL["knowledge"] == "research"
    assert pipeline.ACTION_STAGE_TO_INTERNAL["scenes"] == "scene-spec"
    assert pipeline.ACTION_STAGE_TO_INTERNAL["render"] == "render"


def test_event_level_mapping():
    assert _level_for("job.failed") == "error"
    assert _level_for("agent.retry") == "warn"
    assert _level_for("stage.started") == "info"
    assert _level_for("render.completed") == "info"


def test_all_stages_have_artifact_kind():
    for stage in pipeline.ALL_STAGES:
        assert stage in pipeline.STAGE_ARTIFACT
