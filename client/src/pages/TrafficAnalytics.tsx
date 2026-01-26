import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Globe, Share2, Search, MousePointer, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TrafficAnalytics() {
  const { user, loading: authLoading } = useAuth();
  const { data: stats, isLoading, error } = trpc.trafficTracking.getStats.useQuery(
    { limit: 100 },
    { enabled: !!user && user.role === "admin" }
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>访问受限</CardTitle>
            <CardDescription>此页面仅限管理员访问</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>加载失败</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "search":
        return <Search className="h-4 w-4" />;
      case "social":
        return <Share2 className="h-4 w-4" />;
      case "referral":
        return <ExternalLink className="h-4 w-4" />;
      case "campaign":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <MousePointer className="h-4 w-4" />;
    }
  };

  const getSourceLabel = (sourceType: string) => {
    const labels: Record<string, string> = {
      direct: "直接访问",
      search: "搜索引擎",
      social: "社交媒体",
      referral: "外部链接",
      campaign: "营销活动",
    };
    return labels[sourceType] || sourceType;
  };

  const totalVisits = stats?.bySourceType.reduce((sum, item) => sum + Number(item.count), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">流量来源分析</h1>
          <p className="text-muted-foreground">
            了解访客从哪里找到您的网站
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总访问量</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVisits}</div>
              <p className="text-xs text-muted-foreground">所有来源</p>
            </CardContent>
          </Card>

          {stats?.bySourceType.slice(0, 3).map((item) => (
            <Card key={item.sourceType}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {getSourceLabel(item.sourceType)}
                </CardTitle>
                {getSourceIcon(item.sourceType)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.count}</div>
                <p className="text-xs text-muted-foreground">
                  {totalVisits > 0 ? `${((Number(item.count) / totalVisits) * 100).toFixed(1)}%` : "0%"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Source Type Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>来源类型分布</CardTitle>
            <CardDescription>按访问来源类型统计</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.bySourceType.map((item) => (
                <div key={item.sourceType} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getSourceIcon(item.sourceType)}
                    <span className="font-medium">{getSourceLabel(item.sourceType)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-48 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${totalVisits > 0 ? (Number(item.count) / totalVisits) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* UTM Campaign Tracking */}
        {stats?.byUtmSource && stats.byUtmSource.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>营销活动追踪</CardTitle>
              <CardDescription>UTM参数统计</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>来源</TableHead>
                    <TableHead>媒介</TableHead>
                    <TableHead>活动名称</TableHead>
                    <TableHead className="text-right">访问量</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.byUtmSource.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.utmSource || "-"}</TableCell>
                      <TableCell>{item.utmMedium || "-"}</TableCell>
                      <TableCell>{item.utmCampaign || "-"}</TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Recent Visits */}
        <Card>
          <CardHeader>
            <CardTitle>最近访问</CardTitle>
            <CardDescription>最新的访客来源记录</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>来源类型</TableHead>
                  <TableHead>引荐网址</TableHead>
                  <TableHead>落地页</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.recent.slice(0, 20).map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell className="text-sm">
                      {new Date(visit.createdAt).toLocaleString("zh-CN")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {getSourceIcon(visit.sourceType)}
                        {getSourceLabel(visit.sourceType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {visit.referrer ? (
                        <a
                          href={visit.referrer}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary"
                        >
                          {new URL(visit.referrer).hostname}
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {visit.landingPage ? new URL(visit.landingPage).pathname : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
