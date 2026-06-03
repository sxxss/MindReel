"""API 冒烟：用 TestClient 验证接口形状（数据目录为临时空目录）。"""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"ok": True}


def test_create_and_list_project():
    r = client.post("/api/projects", json={
        "title": "测试", "topic": "快速排序", "audience": "初学者", "durationTargetSeconds": 90,
    })
    assert r.status_code == 200
    proj = r.json()
    assert proj["status"] == "active"
    pid = proj["id"]

    items = client.get("/api/projects").json()
    item = next(i for i in items if i["id"] == pid)
    # 列表项形状：有 sourceCount、无 sources
    assert "sourceCount" in item
    assert "sources" not in item


def test_get_unknown_project_404():
    assert client.get("/api/projects/does-not-exist").status_code == 404


def test_providers_shape_has_five_entries():
    cfg = client.get("/api/providers").json()
    assert set(cfg.keys()) == {"llm", "tts", "image", "video", "factCheck"}


def test_create_job_accepts_known_kind():
    pid = client.post("/api/projects", json={
        "title": "j", "topic": "t", "audience": "a", "durationTargetSeconds": 90,
    }).json()["id"]
    r = client.post(f"/api/projects/{pid}/jobs", json={"kind": "autopilot"})
    assert r.status_code == 200
    assert r.json()["kind"] == "autopilot"


def test_create_job_rejects_unknown_kind():
    pid = client.post("/api/projects", json={
        "title": "j2", "topic": "t", "audience": "a", "durationTargetSeconds": 90,
    }).json()["id"]
    assert client.post(f"/api/projects/{pid}/jobs", json={"kind": "nope"}).status_code == 400
