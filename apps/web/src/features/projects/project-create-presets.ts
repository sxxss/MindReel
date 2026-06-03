// 示例主题 — 覆盖 8 个领域，让用户了解项目适合任意话题。
// 每个主题映射到不同的视觉域，生成完全不同风格的动画。
export type TopicPreset = {
  label: string;
  title: string;
  topic: string;
  audience: string;
  domain: string;
};

export const TOPIC_PRESETS: TopicPreset[] = [
  { domain: "算法", label: "双指针", title: "双指针算法图解", topic: "双指针算法：原理、模板与典型题目（两数之和、滑动窗口）", audience: "有基础的编程学习者" },
  { domain: "网络", label: "TCP握手", title: "TCP 连接建立全解析", topic: "TCP 三次握手与四次挥手：状态机、包交互与常见面试点", audience: "准备技术面试的开发者" },
  { domain: "数学", label: "傅里叶", title: "傅里叶变换直觉入门", topic: "傅里叶变换：从时域到频域的直觉理解，DFT 与实际应用", audience: "理工科在校学生" },
  { domain: "物理", label: "黑洞", title: "黑洞的形成与性质", topic: "黑洞：从恒星死亡到事件视界，霍金辐射与信息悖论", audience: "对天文感兴趣的大众" },
  { domain: "生物", label: "光合作用", title: "光合作用完全指南", topic: "光合作用：光反应与暗反应、叶绿体结构与能量转化", audience: "高中生物学习者" },
  { domain: "历史", label: "法国大革命", title: "法国大革命始末", topic: "法国大革命：从三级会议到拿破仑，历史转折与启蒙思想", audience: "对历史感兴趣的普通读者" },
  { domain: "经济", label: "供需曲线", title: "供需曲线与市场均衡", topic: "供需曲线：市场均衡的形成、价格弹性与政府干预的影响", audience: "经济学入门学习者" },
  { domain: "系统", label: "操作系统", title: "进程与线程的本质", topic: "操作系统中的进程与线程：状态机、上下文切换与并发控制", audience: "计算机专业学生" },
];
