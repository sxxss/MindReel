import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.tsx";

export const SettingsPage = () => (
  <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">设置</CardTitle>
        <CardDescription>阶段 3 之前先把本地工作区、数据目录和服务地址作为只读壳层展示。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-border bg-slate-950/40 px-4 py-4">
          <p className="font-medium">工作区与数据目录</p>
          <p className="mt-2 text-sm text-muted-foreground">
            默认使用仓库内的 `data/projects` 与 `data/providers.json` 存放项目与配置。
          </p>
        </div>
        <div className="rounded-lg border border-border bg-slate-950/40 px-4 py-4">
          <p className="font-medium">API 与事件流</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Web 端通过 `/api/projects` 读取项目，通过 `/api/projects/:id/events` 订阅阶段更新。
          </p>
        </div>
      </CardContent>
    </Card>

    <section className="space-y-4 rounded-lg border border-border bg-card px-6 py-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">当前阶段说明</h2>
        <p className="text-sm text-muted-foreground">
          provider 落盘、render 进程编排和更多环境变量编辑会放在后续阶段接入。
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
        这里先保留稳定入口，方便把全局设置从项目工作区中独立出来。
      </div>
    </section>
  </div>
);
