import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import {
  Award,
  Calendar,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Share2,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SiLinkedin } from "react-icons/si";
import { toast } from "sonner";
import {
  useGetCertificate,
  useGetTemplate,
  useIncrementDownloadCount,
} from "../hooks/useQueries";
import { CertificatePreview } from "../components/certificate/CertificatePreview";
import { DEFAULT_CONFIG } from "../types/certificate";
import type { FieldDefinition } from "../backend.d";

const QR_API = (data: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(data)}&format=svg&bgcolor=ffffff&color=000000&margin=4`;

export function CertificatePage() {
  const params = useParams({ strict: false });
  const certId = (params as { certId?: string }).certId ?? "";
  const { data: cert, isLoading: loadingCert, error: certError } = useGetCertificate(certId);
  const { data: template, isLoading: loadingTemplate } = useGetTemplate(cert?.templateId ?? "");
  const incrementDownload = useIncrementDownloadCount();
  const certRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/cert/${certId}`;
  const verifyUrl = `${window.location.origin}/verify?code=${certId}`;
  const qrUrl = QR_API(verifyUrl);

  useEffect(() => {
    if (cert) {
      document.title = `${cert.recipientName}'s Certificate — CertifyPro`;
      // Set meta tags
      const setMeta = (name: string, content: string) => {
        let el = document.querySelector<HTMLMetaElement>(
          `meta[name="${name}"]`,
        );
        if (!el) {
          el = document.createElement("meta");
          el.setAttribute("name", name);
          document.head.appendChild(el);
        }
        el.setAttribute("content", content);
      };
      const setOg = (property: string, content: string) => {
        let el = document.querySelector<HTMLMetaElement>(
          `meta[property="${property}"]`,
        );
        if (!el) {
          el = document.createElement("meta");
          el.setAttribute("property", property);
          document.head.appendChild(el);
        }
        el.setAttribute("content", content);
      };

      const courseField = cert.fieldValues.find(
        ([k]) => k === "courseTitle",
      )?.[1];
      const title = courseField
        ? `${cert.recipientName} — ${courseField} Certificate`
        : `${cert.recipientName}'s Certificate`;

      setMeta(
        "description",
        `Verified certificate for ${cert.recipientName}. Issued via CertifyPro.`,
      );
      setOg("og:title", title);
      setOg(
        "og:description",
        `Verified certificate for ${cert.recipientName}.`,
      );
      setOg("og:type", "website");
      setOg("og:url", shareUrl);
      setMeta("twitter:card", "summary");
      setMeta("twitter:title", title);
      setMeta(
        "twitter:description",
        `Verified certificate for ${cert.recipientName}.`,
      );
    }
  }, [cert, shareUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Share link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=600");
  };

  const handleDownload = async () => {
    try {
      await incrementDownload.mutateAsync(certId);
    } catch {
      // non-critical
    }

    if (!certRef.current) return;

    try {
      // Fallback to print/screenshot since html2canvas isn't available
      window.print();
      toast.success("Use your browser's print dialog to save as PDF or PNG.");
    } catch {
      window.print();
    }
  };

  const formatDate = (nanoseconds: bigint) => {
    return new Date(Number(nanoseconds) / 1_000_000).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );
  };

  if (loadingCert || loadingTemplate) {
    return (
      <main className="relative z-10 mx-auto max-w-4xl px-4 py-16">
        <Skeleton className="w-full aspect-[1.414/1] rounded-2xl mb-6" />
        <div className="flex gap-3 justify-center">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </main>
    );
  }

  if (certError || !cert) {
    return (
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <Award className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="font-display font-bold text-2xl mb-2">
          Certificate Not Found
        </h2>
        <p className="text-muted-foreground mb-6">
          This certificate may not exist or has been deleted.
        </p>
        <Button asChild variant="outline">
          <Link to="/verify" search={{ code: "" }}>
            Verify Another Certificate
          </Link>
        </Button>
      </main>
    );
  }

  const fieldValues = (Array.isArray(cert.customFields) ? cert.customFields : []) as [string, string][];

  const otherFields = fieldValues.filter(
    ([k]) => k !== "courseTitle" && k !== "issuedBy" && k !== "issueDate",
  );

  const courseTitle = fieldValues.find(([k]) => k === "courseTitle")?.[1];
  const issuedBy = fieldValues.find(([k]) => k === "issuedBy")?.[1];

  const canvasState = (() => {
    try {
      return typeof template?.canvasStateJson === 'string'
        ? JSON.parse(template.canvasStateJson)
        : template?.canvasStateJson;
    } catch {
      return null;
    }
  })();

  const config = canvasState?.config || DEFAULT_CONFIG;
  const fields: FieldDefinition[] = canvasState?.fields || [];
  const logoUrl = canvasState?.logoUrl || template?.logoUrl;
  const backgroundUrl = template?.backgroundUrl;

  const previewData = fieldValues.reduce((acc: any, [k, v]: any) => {
    acc[k] = v;
    return acc;
  }, { recipientName: cert.recipientName });

  return (
    <main className="relative z-10 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Certificate Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          ref={certRef}
        >
          <CertificatePreview
            name={courseTitle || ""}
            description={canvasState?.description || ""}
            fields={fields}
            backgroundUrl={backgroundUrl}
            logoUrl={logoUrl}
            config={config}
            previewData={previewData}
          />
        </motion.div>

        {/* Actions */}
        <motion.div
          className="mt-6 flex flex-wrap gap-3 justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Button
            variant="outline"
            onClick={handleCopy}
            className={copied ? "border-primary text-primary" : ""}
          >
            {copied ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </>
            )}
          </Button>

          <Button
            className="bg-[#0077B5] hover:bg-[#006097] text-white"
            onClick={handleLinkedIn}
          >
            <SiLinkedin className="mr-2 h-4 w-4" />
            Share on LinkedIn
          </Button>

          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PNG
          </Button>

          <Button asChild variant="outline">
            <Link to="/verify" search={{ code: cert.uniqueCode }}>
              <Shield className="mr-2 h-4 w-4" />
              Verify
            </Link>
          </Button>
        </motion.div>

        {/* Certificate metadata */}
        <motion.div
          className="mt-8 rounded-xl border border-border bg-card p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold text-base">
              Certificate Details
            </h2>
            <Badge className="bg-primary/15 text-primary border-primary/20 ml-auto">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Verified
            </Badge>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Recipient</p>
              <p className="font-medium">{cert.recipientName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="font-medium">{cert.recipientEmail || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Issue Date</p>
              <p className="font-medium">{formatDate(cert.issuedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Certificate ID
              </p>
              <p className="font-mono text-xs">{cert.id}</p>
            </div>
            {fieldValues.map(([key, value]) => (
              <div key={key}>
                <p className="text-xs text-muted-foreground mb-1 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <p className="font-medium">{value}</p>
              </div>
            ))}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Downloads</p>
              <p className="font-medium">{Number(cert.downloadCount)}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Share2 className="h-3.5 w-3.5" />
              <span>
                Public sharing is {cert.publicShare ? "enabled" : "disabled"}
              </span>
            </div>
            <Button asChild variant="ghost" size="sm">
              <a href={verifyUrl} target="_blank" rel="noopener noreferrer">
                Verify online
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
