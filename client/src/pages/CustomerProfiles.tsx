import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Megaphone } from "lucide-react";
import { Link } from "wouter";

interface CustomerProfile {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  description: string;
  painPoints: string[];
  solutions: string[];
  videoPlaceholder: string;
  accentColor: string;
}

const customerProfiles: CustomerProfile[] = [
  {
    id: "ecommerce",
    title: "跨境电商 & 产品推广者",
    subtitle: "Global Product Promoters",
    icon: <TrendingUp className="h-8 w-8" />,
    description: "想要将产品推向全球市场的商家和品牌方，需要创作适合不同地区文化的营销内容。",
    painPoints: [
      "不了解目标市场的文化习惯和消费偏好",
      "缺乏本地化内容创作能力",
      "营销素材翻译生硬，无法引起共鸣",
      "投入大量成本却难以打开海外市场"
    ],
    solutions: [
      "快速了解目标市场热门内容趋势",
      "生成符合当地文化的营销脚本",
      "降低内容本地化成本",
      "提高海外市场转化率"
    ],
    videoPlaceholder: "上传跨境电商客户案例视频",
    accentColor: "from-blue-500 to-cyan-500"
  },
  {
    id: "creator",
    title: "内容创作者",
    subtitle: "Content Creators",
    icon: <Users className="h-8 w-8" />,
    description: "想要创作热门内容、获取流量和广告收入的视频创作者和自媒体从业者。",
    painPoints: [
      "不知道什么内容在目标市场受欢迎",
      "创意枯竭，难以持续产出",
      "内容同质化严重，难以脱颖而出",
      "跨市场内容创作门槛高"
    ],
    solutions: [
      "发现全球热门视频创意",
      "快速改编为本地化内容",
      "避免版权问题的创意转换",
      "提高内容产出效率和质量"
    ],
    videoPlaceholder: "上传内容创作者成功案例视频",
    accentColor: "from-purple-500 to-pink-500"
  },
  {
    id: "kol",
    title: "KOL & 意见领袖",
    subtitle: "Influencers & Opinion Leaders",
    icon: <Megaphone className="h-8 w-8" />,
    description: "想要扩大全球影响力、吸引国际粉丝的网红、博主和意见领袖。",
    painPoints: [
      "粉丝群体局限在单一市场",
      "不了解如何吸引国际观众",
      "语言和文化障碍限制影响力扩展",
      "缺乏跨文化内容创作经验"
    ],
    solutions: [
      "了解不同市场的受众喜好",
      "创作能引起全球共鸣的内容",
      "突破语言和文化壁垒",
      "快速扩展国际粉丝群体"
    ],
    videoPlaceholder: "上传KOL成功出海案例视频",
    accentColor: "from-orange-500 to-red-500"
  }
];

export default function CustomerProfiles() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header Section */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex items-center justify-center gap-4">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                首页
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link href="/customer-profiles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                目标客户
              </Link>
            </div>
            <Badge variant="outline" className="mb-4">
              目标客户
            </Badge>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              我们服务的三类客户
            </h1>
            <p className="text-lg text-muted-foreground">
              Content Factory 帮助不同类型的用户突破语言和文化障碍，
              创作能够引起全球共鸣的本地化内容
            </p>
          </div>
        </div>
      </div>

      {/* Customer Profiles Section */}
      <div className="container py-12 md:py-16">
        <div className="space-y-16">
          {customerProfiles.map((profile, index) => (
            <div
              key={profile.id}
              className={`flex flex-col gap-8 ${
                index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
              }`}
            >
              {/* Video Player Section */}
              <div className="flex-1">
                <div className="sticky top-8">
                  <Card className="overflow-hidden">
                    <div className={`bg-gradient-to-br ${profile.accentColor} p-1`}>
                      <div className="aspect-video bg-background flex items-center justify-center">
                        {/* Video player placeholder - will be replaced with actual video */}
                        <div className="text-center p-8">
                          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${profile.accentColor} text-white mb-4`}>
                            {profile.icon}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {profile.videoPlaceholder}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            视频格式: MP4, WebM | 最大尺寸: 50MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 space-y-6">
                <div>
                  <div className={`inline-flex items-center gap-3 mb-4 p-3 rounded-lg bg-gradient-to-br ${profile.accentColor} text-white`}>
                    {profile.icon}
                    <div>
                      <h2 className="text-2xl font-bold">{profile.title}</h2>
                      <p className="text-sm opacity-90">{profile.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    {profile.description}
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">痛点与挑战</CardTitle>
                    <CardDescription>这类客户面临的主要问题</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {profile.painPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-destructive mt-1">❌</span>
                          <span className="text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">我们的解决方案</CardTitle>
                    <CardDescription>Content Factory 如何帮助您</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {profile.solutions.map((solution, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">✅</span>
                          <span className="text-sm">{solution}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t bg-muted/50">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">
              无论您是哪种类型的用户
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Content Factory 都能帮助您快速创作出适合目标市场的本地化内容，
              突破语言和文化障碍，触达全球受众
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                立即开始使用
              </a>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                了解更多功能
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
