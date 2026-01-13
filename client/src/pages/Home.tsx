import { useState } from "react";
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
import { Sparkles, Video, Globe, Download, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [targetMarket, setTargetMarket] = useState("brazil");
  const [targetLanguage, setTargetLanguage] = useState("portuguese-br");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

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

  const handleGenerate = async () => {
    if (!keyword.trim()) {
      toast.error("请输入搜索关键词");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 模拟结果
      setResult({
        originalVideo: {
          title: keyword + " - 2025年最火合集",
          channel: "Demo Channel",
          views: "1.2M",
        },
        analysis: {
          coreIdea: "汇聚年度热门内容，打造欢乐娱乐盛宴",
          contentType: "娱乐合集",
          targetAudience: "喜爱娱乐内容的观众",
        },
        script: `### Título: "Bom Humor em Ação: As Melhores ${keyword} do Ano 2025"

### Roteiro

#### 1. Abertura
- **Cena:** Um cenário fictício de uma festa de fim de ano no Rio de Janeiro...
- **Diálogo:** "Escutem, eu tenho uma piada que é tão boa..."

#### 2. Cena 1: "O Enganador de Amor"
- **Cena:** Um casal no parque, o homem está tentando fazer uma piada...
- **Localização:** O parque de Ipanema, com a vista da praia...

#### 3. Cena 2: "O Desafio da Cerveja"
- **Cena:** Um grupo de amigos no bar...
- **Localização:** Bar no bairro de Leblon...

### Elementos Localizados
- **Música de Chorinho:** A música "Chorinho do Trem"...
- **Parques e Praias:** A utilização de cenários como o Parque de Ipanema...`
      });
      
      toast.success("脚本生成成功！");
    } catch (error) {
      toast.error("生成失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const content = `使用模型: 智谱AI GLM-4-Flash
原始视频: ${result.originalVideo.title}
频道: ${result.originalVideo.channel}
观看量: ${result.originalVideo.views}

============================================================
分析结果:
核心创意: ${result.analysis.coreIdea}
内容类型: ${result.analysis.contentType}
目标受众: ${result.analysis.targetAudience}

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
        
        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              <span>AI驱动的内容本地化工具</span>
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
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="market">目标市场</Label>
                  <Select
                    value={targetMarket}
                    onValueChange={setTargetMarket}
                    disabled={loading}
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
                    disabled={loading}
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
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
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
                {!result && !loading && (
                  <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
                    <p className="text-sm text-muted-foreground">
                      输入关键词并点击生成按钮开始
                    </p>
                  </div>
                )}

                {loading && (
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
