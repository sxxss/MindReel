"""测试夹具：把数据目录指向临时空目录，保证测试不读写真实 data/。"""
import os
import tempfile

# 必须在导入 app.* 之前设置（app.config 在导入时读取环境变量）
os.environ.setdefault("AUTO_DATA_DIR", tempfile.mkdtemp(prefix="mindreel-test-"))
os.environ.setdefault("AUTO_PROVIDERS_PATH", os.path.join(os.environ["AUTO_DATA_DIR"], "providers.json"))
