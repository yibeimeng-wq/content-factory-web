import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Link2, QrCode, FileText, Mail, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function LinkGenerator() {
  const [baseUrl, setBaseUrl] = useState(window.location.origin);
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  // Predefined templates
  const templates = [
    {
      id: "cv",
      name: "简历 / CV",
      icon: FileText,
      source: "cv",
      medium: "pdf",
      campaign: "job_application_2026",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: Share2,
      source: "linkedin",
      medium: "social",
      campaign: "profile_link",
    },
    {
      id: "email",
      name: "邮件签名",
      icon: Mail,
      source: "email_signature",
      medium: "email",
      campaign: "personal_outreach",
    },
    {
      id: "twitter",
      name: "Twitter/X",
      icon: Share2,
      source: "twitter",
      medium: "social",
      campaign: "social_share",
    },
  ];

  const generateUrl = () => {
    if (!utmSource) {
      return baseUrl;
    }

    const params = new URLSearchParams();
    if (utmSource) params.append("utm_source", utmSource);
    if (utmMedium) params.append("utm_medium", utmMedium);
    if (utmCampaign) params.append("utm_campaign", utmCampaign);

    return `${baseUrl}?${params.toString()}`;
  };

  const generatedUrl = generateUrl();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      toast.success("链接已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("复制失败，请手动复制");
    }
  };

  const handleGenerateQR = () => {
    // Using a free QR code API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(generatedUrl)}`;
    setQrCodeUrl(qrUrl);
  };

  const applyTemplate = (template: typeof templates[0]) => {
    setUtmSource(template.source);
    setUtmMedium(template.medium);
    setUtmCampaign(template.campaign);
    toast.success(`已应用"${template.name}"模板`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">UTM 链接生成器</h1>
          <p className="text-muted-foreground">
            创建带追踪参数的链接，了解访客来源
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Generator */}
          <div className="space-y-6">
            {/* Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">快速模板</CardTitle>
                <CardDescription>选择预设模板快速生成链接</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="h-auto flex-col gap-2 py-4"
                      onClick={() => applyTemplate(template)}
                    >
                      <template.icon className="h-5 w-5" />
                      <span className="text-sm">{template.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Manual Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">自定义参数</CardTitle>
                <CardDescription>手动设置UTM追踪参数</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="baseUrl">基础URL</Label>
                  <Input
                    id="baseUrl"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="utmSource">
                    来源 (utm_source) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="utmSource"
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    placeholder="例如: cv, linkedin, newsletter"
                  />
                  <p className="text-xs text-muted-foreground">
                    标识流量来源，如 cv、linkedin、newsletter
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="utmMedium">媒介 (utm_medium)</Label>
                  <Input
                    id="utmMedium"
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    placeholder="例如: pdf, social, email"
                  />
                  <p className="text-xs text-muted-foreground">
                    标识媒介类型，如 pdf、social、email
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="utmCampaign">活动名称 (utm_campaign)</Label>
                  <Input
                    id="utmCampaign"
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    placeholder="例如: job_application_2026"
                  />
                  <p className="text-xs text-muted-foreground">
                    标识具体活动，如 job_application_2026
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Result */}
          <div className="space-y-6">
            {/* Generated URL */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">生成的链接</CardTitle>
                <CardDescription>复制此链接使用</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg break-all text-sm font-mono">
                  {generatedUrl}
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCopy} className="flex-1">
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        复制链接
                      </>
                    )}
                  </Button>
                  <Button onClick={handleGenerateQR} variant="outline">
                    <QrCode className="mr-2 h-4 w-4" />
                    生成二维码
                  </Button>
                </div>

                {qrCodeUrl && (
                  <div className="flex flex-col items-center gap-3 p-4 border rounded-lg">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                    <p className="text-sm text-muted-foreground text-center">
                      扫描二维码访问链接
                    </p>
                    <a
                      href={qrCodeUrl}
                      download="qrcode.png"
                      className="text-sm text-primary hover:underline"
                    >
                      下载二维码
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">使用说明</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">📄 简历使用</h4>
                  <p className="text-muted-foreground">
                    将生成的链接添加到简历的"个人网站"或"作品集"栏目
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">📱 二维码使用</h4>
                  <p className="text-muted-foreground">
                    下载二维码图片，插入到PDF简历中，方便扫描访问
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">📊 查看数据</h4>
                  <p className="text-muted-foreground">
                    访问 <a href="/analytics" className="text-primary hover:underline">/analytics</a> 页面查看通过此链接访问的统计数据
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
