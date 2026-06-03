export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const statusLabels: Record<string, string> = {
  draft: "草稿",
  active: "进行中",
  archived: "已归档",
  pending: "排队中",
  running: "运行中",
  succeeded: "已完成",
  failed: "失败",
  canceled: "已取消",
};

export const formatStatusLabel = (value: string) => statusLabels[value] ?? value;
