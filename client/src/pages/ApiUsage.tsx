import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Activity, Clock, TrendingUp, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";

export default function ApiUsage() {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === "admin";

  // Set page title
  useEffect(() => {
    document.title = "API使用统计 - Content Factory";
  }, []);

  // Fetch stats based on role
  const { data: stats, isLoading, error } = trpc.apiUsage[
    isAdmin ? "getAdminStats" : "getMyStats"
  ].useQuery({ limit: 100 });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>需要登录</CardTitle>
            <CardDescription>请登录后查看API使用统计</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>登录</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>加载失败</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { totalStats, byOperation, byUser, recent } = stats || {};

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">API使用统计</h1>
              <p className="text-muted-foreground mt-1">
                {isAdmin ? "查看所有用户的API调用情况" : "查看您的API调用情况"}
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="/">返回首页</a>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总调用次数</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalStats?.totalCalls?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                成功率: {totalStats?.successRate?.toFixed(1) || 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总Token消耗</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalStats?.totalTokens?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                输入: {totalStats?.totalPromptTokens?.toLocaleString() || 0} | 输出:{" "}
                {totalStats?.totalCompletionTokens?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalStats?.avgResponseTime
                  ? `${(totalStats.avgResponseTime / 1000).toFixed(2)}s`
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">毫秒级响应</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">操作类型</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{byOperation?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">不同的API操作</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* By Operation */}
          <Card>
            <CardHeader>
              <CardTitle>按操作类型统计</CardTitle>
              <CardDescription>不同API操作的调用情况</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {byOperation && byOperation.length > 0 ? (
                  byOperation.map((op: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{op.operation}</p>
                        <p className="text-sm text-muted-foreground">
                          {op.count} 次调用 · {op.totalTokens?.toLocaleString() || 0} tokens
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {op.avgResponseTime
                            ? `${(op.avgResponseTime / 1000).toFixed(2)}s`
                            : "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">平均响应</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">暂无数据</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* By User (Admin only) */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>按用户统计</CardTitle>
                <CardDescription>各用户的API使用情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {byUser && byUser.length > 0 ? (
                    byUser.map((u: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">用户 ID: {u.userId}</p>
                          <p className="text-sm text-muted-foreground">
                            {u.count} 次调用
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {u.totalTokens?.toLocaleString() || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">tokens</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">暂无数据</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent API Calls */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>最近调用记录</CardTitle>
            <CardDescription>最近100次API调用详情</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">时间</th>
                    <th className="text-left py-2 px-4">操作</th>
                    <th className="text-left py-2 px-4">模型</th>
                    <th className="text-right py-2 px-4">Tokens</th>
                    <th className="text-right py-2 px-4">响应时间</th>
                    <th className="text-center py-2 px-4">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {recent && recent.length > 0 ? (
                    recent.map((log: any) => (
                      <tr key={log.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4 text-sm">
                          {new Date(log.createdAt).toLocaleString("zh-CN")}
                        </td>
                        <td className="py-2 px-4 text-sm">{log.operation}</td>
                        <td className="py-2 px-4 text-sm">{log.model || "N/A"}</td>
                        <td className="py-2 px-4 text-sm text-right">
                          {log.totalTokens?.toLocaleString() || "N/A"}
                        </td>
                        <td className="py-2 px-4 text-sm text-right">
                          {log.responseTime
                            ? `${(log.responseTime / 1000).toFixed(2)}s`
                            : "N/A"}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {log.success ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                              成功
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                              失败
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        暂无调用记录
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
