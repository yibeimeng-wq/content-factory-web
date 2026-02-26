import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Video, Globe, Download, Loader2, CheckCircle2, TrendingUp, Users, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { TrackedVideo } from "@/components/TrackedVideo";
import { useTrafficTracking } from "@/hooks/useTrafficTracking";

export default function Home() {
  // Track visitor traffic source
  useTrafficTracking();

  // Set page title for SEO
  useEffect(() => {
    document.title = 'Content Factory - AI视频创意本地化工具 | YouTube/TikTok内容本地化重创平台';
  }, []);

  // Jesus Manus Demo - storyboard data
  const SHOTS = [
    {
      id: 1,
      label: "Shot 1",
      zhTitle: "伯利恒的诞生",
      ptTitle: "O Nascimento em Belém",
      duration: 6,
      start: 0,
      end: 6,
      camera: "Slow Zoom In",
      scene: "星空下的伯利恒，木制小教堂烛光摇曳，银河横贯夜空，镜头缓缓推进。",
    },
    {
      id: 2,
      label: "Shot 2",
      zhTitle: "圣保罗的传道",
      ptTitle: "A Caminhada em São Paulo",
      duration: 8,
      start: 5.5,
      end: 13,
      camera: "Pan Right",
      scene: "圣保罗城市天际线，巴洛克大教堂与现代摩天楼并立，黄金时刻光线，镜头右摇。",
    },
    {
      id: 3,
      label: "Shot 3",
      zhTitle: "里约热内卢的奇迹",
      ptTitle: "O Milagre do Rio de Janeiro",
      duration: 8,
      start: 13,
      end: 20.5,
      camera: "Dolly In",
      scene: "科帕卡巴纳海滩日落，耶稣发光身影现于山顶，双臂展开，镜头推轨前进。",
    },
    {
      id: 4,
      label: "Shot 4",
      zhTitle: "伊瓜苏的受难",
      ptTitle: "A Crucificação em Foz do Iguaçu",
      duration: 8,
      start: 20.5,
      end: 28,
      camera: "Static",
      scene: "伊瓜苏瀑布磅礴水雾中，木制十字架剪影矗立前景，戏剧性侧光，固定镜头。",
    },
    {
      id: 5,
      label: "Shot 5",
      zhTitle: "欧鲁普雷图的复活",
      ptTitle: "A Ressurreição em Ouro Preto",
      duration: 8,
      start: 28,
      end: 36,
      camera: "Tilt Up",
      scene: "欧鲁普雷图巴洛克古城，鹅卵石街道，彩虹横跨金色教堂，镜头由地面缓缓上摇。",
    },
  ];

  const [activeShot, setActiveShot] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const demoVideoRef = useRef<HTMLVideoElement | null>(null);

  const handleTimeUpdate = useCallback(() => {
    const video = demoVideoRef.current;
    if (!video) return;
    const t = video.currentTime;
    const duration = video.duration || 36;
    setVideoProgress((t / duration) * 100);
    const idx = SHOTS.findIndex((s, i) => {
      const next = SHOTS[i + 1];
      return t >= s.start && (next ? t < next.start : true);
    });
    if (idx !== -1) setActiveShot(idx);
  }, []);

  useEffect(() => {
    // Attach timeupdate listener after video element mounts
    const interval = setInterval(() => {
      const video = document.getElementById('video-jesus-manus') as HTMLVideoElement | null;
      if (video && !demoVideoRef.current) {
        demoVideoRef.current = video;
        video.addEventListener('timeupdate', handleTimeUpdate);
        clearInterval(interval);
      }
    }, 300);
    return () => {
      clearInterval(interval);
      if (demoVideoRef.current) {
        demoVideoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [handleTimeUpdate]);

  const [keyword, setKeyword] = useState("");
  const [targetMarket, setTargetMarket] = useState("brazil");
  const [targetLanguage, setTargetLanguage] = useState("portuguese-br");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 获取用户状态
  const { user, isAuthenticated } = useAuth();

  // 获取配额状态
  const { data: quotaData, refetch: refetchQuota } = trpc.contentFactory.getQuota.useQuery(undefined, {
    refetchInterval: 30000, // 每30秒刷新
  });

  // 退出登录
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = '/';
    },
  });

  // 市场和语言的映射关系
  const marketLanguageMap: Record<string, string> = {
    "brazil": "portuguese-br",
    "mexico": "spanish-mx",
    "indonesia": "indonesian",
    "thailand": "thai",
    "vietnam": "vietnamese",
    "philippines": "filipino",
  };

  const markets = [
    { value: "brazil", label: "巴西 (Brazil)" },
    { value: "mexico", label: "墨西哥 (Mexico)" },
    { value: "indonesia", label: "印尼 (Indonesia)" },
    { value: "thailand", label: "泰国 (Thailand)" },
    { value: "vietnam", label: "越南 (Vietnam)" },
    { value: "philippines", label: "菲律宾 (Philippines)" },
  ];

  const languages = [
    { value: "portuguese-br", label: "葡萄牙语（巴西）" },
    { value: "spanish-mx", label: "西班牙语（墨西哥）" },
    { value: "indonesian", label: "印尼语" },
    { value: "thai", label: "泰语" },
    { value: "vietnamese", label: "越南语" },
    { value: "filipino", label: "菲律宾语" },
  ];

  // 处理市场变化，自动更新语言
  const handleMarketChange = (market: string) => {
    setTargetMarket(market);
    const correspondingLanguage = marketLanguageMap[market];
    if (correspondingLanguage) {
      setTargetLanguage(correspondingLanguage);
    }
  };

  const generateMutation = trpc.contentFactory.generate.useMutation();

  const handleGenerate = async () => {
    if (!keyword.trim()) {
      toast.error("请输入搜索关键词");
      return;
    }

    // 检查配额
    if (quotaData && !quotaData.allowed) {
      if (quotaData.isGuest) {
        // 访客超限，引导登录
        toast.error(
          `访客每日配额已用完！您今天已使用 ${quotaData.limit} 次生成。\n\n登录后可获得每天 10 次的完整配额！`,
          {
            duration: 5000,
            action: {
              label: "立即登录",
              onClick: () => window.location.href = getLoginUrl(),
            },
          }
        );
      } else {
        // 登录用户超限
        toast.error(
          `每日配额已用完！您今天已使用 ${quotaData.limit} 次生成。配额将在 ${new Date(quotaData.resetAt).toLocaleString('zh-CN')} 重置。`
        );
      }
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const response = await generateMutation.mutateAsync({
        keyword,
        targetMarket,
        targetLanguage,
      });

      if (response.success) {
        setResult(response.data);
        toast.success("脚本生成成功！");
        // 刷新配额显示
        refetchQuota();
      } else {
        toast.error("生成失败，请重试");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "生成失败，请重试");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const keyElementsStr = result.analysis.keyElements ? result.analysis.keyElements.join(", ") : "N/A";
    
    const content = `使用模型: 智谱AI GLM-4-Flash
原始视频: ${result.originalVideo.title}
频道: ${result.originalVideo.channel}
观看量: ${result.originalVideo.views}

============================================================
分析结果:
核心创意: ${result.analysis.coreIdea}
内容类型: ${result.analysis.contentType}
目标受众: ${result.analysis.targetAudience}
关键元素: ${keyElementsStr}

============================================================
重新创作的脚本:
============================================================

${result.script}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recreated_script_${targetMarket}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("脚本已下载");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMS4xMDUuODk1LTIgMi0yaDJjMS4xMDUgMCAyIC44OTUgMiAydjJjMCAxLjEwNS0uODk1IDItMiAyaC0yYy0xLjEwNSAwLTItLjg5NS0yLTJ2LTJ6TTEyIDM2YzAtMS4xMDUuODk1LTIgMi0yaDJjMS4xMDUgMCAyIC44OTUgMiAydjJjMCAxLjEwNS0uODk1IDItMiAyaC0yYy0xLjEwNSAwLTItLjg5NS0yLTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
        
        {/* Top Navigation Bar */}
        <div className="container relative pt-6">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Content Factory</div>
            
            <div className="flex items-center gap-4">
              {/* Quota Display */}
              {quotaData && (
                <div className="text-sm text-muted-foreground">
                  {quotaData.isGuest ? (
                    <span>访客配额：{quotaData.remaining}/{quotaData.limit}次</span>
                  ) : (
                    <span>今日剩余：{quotaData.remaining}/{quotaData.limit}次</span>
                  )}
                </div>
              )}
              
              {/* Login/User Button */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">欢迎，{user.name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('确定要退出登录吗？')) {
                        logoutMutation.mutate();
                      }
                    }}
                  >
                    退出
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => window.location.href = getLoginUrl()}
                  size="sm"
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  登录解锁完整配额
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="container relative py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              <span>AI驱动的内容本地化工具</span>
            </div>
            
            <div className="mb-6 flex items-center justify-center gap-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                首页
              </a>
              <span className="text-muted-foreground">·</span>
              <a href="#target-customers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                目标客户
              </a>
            </div>
            
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Content Factory
            </h1>
            
            <p className="mb-8 text-xl text-muted-foreground md:text-2xl">
              从YouTube/TikTok热门视频中提取创意，
              <br className="hidden sm:inline" />
              使用AI重新创作为适合不同市场的本地化脚本
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>完全免费</span>
              </div>

              {quotaData && quotaData.isGuest && quotaData.remaining <= 0 && (
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-5 w-5" />
                  <span>
                    <a href={getLoginUrl()} className="underline hover:text-amber-700 dark:hover:text-amber-300">
                      登录后可获得10次/天配额
                    </a>
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>智谱AI驱动</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>支持多国市场</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input Section */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  创建内容
                </CardTitle>
                <CardDescription>
                  输入搜索关键词，选择目标市场和语言
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="keyword">搜索关键词</Label>
                  <Input
                    id="keyword"
                    placeholder="例如：搞笑恶作剧、美食教程、旅游vlog"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    disabled={generating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="market">目标市场</Label>
                  <Select
                    value={targetMarket}
                    onValueChange={handleMarketChange}
                    disabled={generating}
                  >
                    <SelectTrigger id="market">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {markets.map((market) => (
                        <SelectItem key={market.value} value={market.value}>
                          {market.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">目标语言</Label>
                  <Select
                    value={targetLanguage}
                    onValueChange={setTargetLanguage}
                    disabled={generating}
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      生成脚本
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  生成结果
                </CardTitle>
                <CardDescription>
                  {result ? "脚本已生成，可以下载" : "等待生成..."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!result && !generating && (
                  <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
                    <p className="text-sm text-muted-foreground">
                      输入关键词并点击生成按钮开始
                    </p>
                  </div>
                )}

                {generating && (
                  <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">
                        正在分析视频并生成脚本...
                      </p>
                    </div>
                  </div>
                )}

                {result && (
                  <div className="space-y-4">
                    <Tabs defaultValue="analysis" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="analysis">分析结果</TabsTrigger>
                        <TabsTrigger value="script">生成脚本</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="analysis" className="space-y-3 pt-4">
                        <div>
                          <h4 className="mb-1 text-sm font-medium">原始视频</h4>
                          <p className="text-sm text-muted-foreground">
                            {result.originalVideo.title}
                          </p>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-medium">核心创意</h4>
                          <p className="text-sm text-muted-foreground">
                            {result.analysis.coreIdea}
                          </p>
                        </div>
                        <div>
                          <h4 className="mb-1 text-sm font-medium">内容类型</h4>
                          <p className="text-sm text-muted-foreground">
                            {result.analysis.contentType}
                          </p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="script" className="pt-4">
                        <div className="max-h-64 overflow-y-auto rounded-lg bg-muted/50 p-4">
                          <pre className="whitespace-pre-wrap text-xs">
                            {result.script}
                          </pre>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      下载脚本
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Target Customers Section */}
      <div id="target-customers" className="border-t bg-gradient-to-b from-background to-muted/20 py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              我们服务的三类客户
            </h2>
            <p className="text-lg text-muted-foreground">
              Content Factory 帮助不同类型的用户突破语言和文化障碍，
              创作能够引起全球共鸣的本地化内容
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Customer Type 1: E-commerce */}
            <Card className="flex flex-col bg-transparent border-none shadow-none">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg group">
                  <TrackedVideo 
                    videoId="video-ecommerce"
                    videoType="ecommerce"
                    videoSrc="/videos/ContentFactory_GlobalMotors.mp4"
                  />
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => {
                      const video = document.getElementById('video-ecommerce') as HTMLVideoElement;
                      if (video) {
                        if (video.paused) {
                          video.play();
                        } else {
                          video.pause();
                        }
                      }
                    }}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-6 pt-0 space-y-4">
                <div className="inline-flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white w-full">
                  <TrendingUp className="h-6 w-6 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">跨境电商 & 产品推广者</h3>
                    <p className="text-xs opacity-90">Global Product Promoters</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">痛点与挑战</h4>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="text-destructive mt-0.5">❌</span>
                        <span>不了解目标市场的文化习惯</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-destructive mt-0.5">❌</span>
                        <span>缺乏本地化内容创作能力</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-destructive mt-0.5">❌</span>
                        <span>营销素材翻译生硬</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold mb-2">我们的解决方案</h4>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✅</span>
                        <span>快速了解目标市场趋势</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✅</span>
                        <span>生成符合当地文化的脚本</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✅</span>
                        <span>降低内容本地化成本</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Type 2: Content Creators */}
            <Card className="flex flex-col bg-transparent border-none shadow-none">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg group">
                  <TrackedVideo 
                    videoId="video-creators"
                    videoType="creators"
                    videoSrc="/videos/ContentFactory_contentcreators.mp4"
                  />
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => {
                      const video = document.getElementById('video-creators') as HTMLVideoElement;
                      if (video) {
                        if (video.paused) {
                          video.play();
                        } else {
                          video.pause();
                        }
                      }
                    }}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-6 pt-0 space-y-4">
                <div className="inline-flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white w-full">
                  <Users className="h-6 w-6 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">内容创作者</h3>
                    <p className="text-xs opacity-90">Content Creators</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">痛点与挑战</h4>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="text-destructive mt-0.5">❌</span>
                        <span>不知道什么内容受欢迎</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-destructive mt-0.5">❌</span>
                        <span>创意枯竭，难以持续产出</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-destructive mt-0.5">❌</span>
                        <span>内容同质化严重</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold mb-2">我们的解决方案</h4>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✅</span>
                        <span>发现全球热门视频创意</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✅</span>
                        <span>快速改编为本地化内容</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✅</span>
                        <span>提高内容产出效率</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Type 3: KOLs */}
            <Card className="flex flex-col bg-transparent border-none shadow-none">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg group">
                  <TrackedVideo 
                    videoId="video-kols"
                    videoType="kols"
                    videoSrc="/videos/ContentFactory_influencers.mp4"
                  />
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => {
                      const video = document.getElementById('video-kols') as HTMLVideoElement;
                      if (video) {
                        if (video.paused) {
                          video.play();
                        } else {
                          video.pause();
                        }
                      }
                    }}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-6 pt-0 space-y-4">
                <div className="inline-flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white w-full">
                  <Megaphone className="h-6 w-6 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">KOL & 意见领袖</h3>
                    <p className="text-xs opacity-90">Influencers & Opinion Leaders</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">痛点与挑战</h4>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="text-destructive mt-0.5">❌</span>
                        <span>粉丝群体局限在单一市场</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-destructive mt-0.5">❌</span>
                        <span>不了解如何吸引国际观众</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-destructive mt-0.5">❌</span>
                        <span>语言和文化障碍限制影响力</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold mb-2">我们的解决方案</h4>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✅</span>
                        <span>了解不同市场的受众喜好</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✅</span>
                        <span>创作引起全球共鸣的内容</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✅</span>
                        <span>快速扩展国际粉丝群体</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Jesus Manus Demo Section */}
      <div id="jesus-manus-demo" className="border-t bg-gradient-to-b from-background to-muted/20 py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            {/* Section Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
                <Sparkles className="h-4 w-4" />
                Manus AI Video Production Demo
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                复活节 Jesus AIGC视频
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                目标市场：巴西，目标语言：葡萄牙语
              </p>
            </div>

            {/* Video Player — same frame as KOL demo */}
            <Card className="flex flex-col bg-transparent border-none shadow-none">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg group">
                  <TrackedVideo
                    videoId="video-jesus-manus"
                    videoType="jesus-manus"
                    videoSrc="/videos/ContentFactory_jesus_manus_demo.mp4"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => {
                      const video = document.getElementById('video-jesus-manus') as HTMLVideoElement;
                      if (video) {
                        if (video.paused) { video.play(); } else { video.pause(); }
                      }
                    }}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0 pt-4 space-y-4">
                {/* Timeline progress bar */}
                <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-primary"
                    style={{ width: `${videoProgress}%`, transition: 'width 0.25s linear' }}
                  />
                  {/* Shot boundary markers */}
                  {SHOTS.slice(1).map((shot) => (
                    <div
                      key={shot.id}
                      className="absolute top-0 h-full w-px bg-background/60"
                      style={{ left: `${(shot.start / 36) * 100}%` }}
                    />
                  ))}
                </div>

                {/* Storyboard cards */}
                <div className="grid grid-cols-5 gap-2">
                  {SHOTS.map((shot, idx) => (
                    <button
                      key={shot.id}
                      className={[
                        'text-left rounded-lg border p-3 space-y-1.5 cursor-pointer',
                        'transition-all duration-500 ease-in-out',
                        activeShot === idx
                          ? 'border-primary bg-primary/10 shadow-md scale-[1.03]'
                          : 'border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/60',
                      ].join(' ')}
                      onClick={() => {
                        const video = document.getElementById('video-jesus-manus') as HTMLVideoElement;
                        if (video) {
                          video.currentTime = shot.start;
                          video.play();
                        }
                      }}
                    >
                      <div className={[
                        'text-xs font-bold transition-colors duration-500',
                        activeShot === idx ? 'text-primary' : 'text-muted-foreground',
                      ].join(' ')}>
                        {shot.label}
                      </div>
                      <div className="text-xs font-semibold leading-tight">{shot.zhTitle}</div>
                      <div className="text-[10px] text-muted-foreground leading-tight italic">{shot.ptTitle}</div>
                      <div className="flex items-center gap-1 pt-0.5">
                        <span className={[
                          'inline-block h-1.5 w-1.5 rounded-full transition-colors duration-500',
                          activeShot === idx ? 'bg-primary' : 'bg-muted-foreground/40',
                        ].join(' ')} />
                        <span className="text-[10px] text-muted-foreground">{shot.duration}s · {shot.camera}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">{shot.scene}</p>
                    </button>
                  ))}
                </div>

                <p className="text-center text-xs text-muted-foreground pt-1">
                  点击任意分镜卡片可跳转至对应片段 · 5 段视频 · 淡入淡出过渡 · 1280×720 · 36 秒 · 由 Manus AI 自动合并
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="border-t bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              为什么选择Content Factory？
            </h2>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">AI驱动</h3>
                <p className="text-sm text-muted-foreground">
                  使用智谱AI GLM-4-Flash模型，完全免费，质量优秀
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">深度本地化</h3>
                <p className="text-sm text-muted-foreground">
                  不仅翻译，更包含文化适配、场景本地化
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">创意转换</h3>
                <p className="text-sm text-muted-foreground">
                  提取核心创意，重新创作，避免版权问题
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 Content Factory. Powered by Manus AI & 智谱AI.</p>
        </div>
      </footer>
    </div>
  );
}
