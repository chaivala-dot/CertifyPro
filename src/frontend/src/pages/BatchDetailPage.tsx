import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Package,
  QrCode,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useGetBatch } from "../hooks/useQueries";


function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return (
        <Badge className="bg-primary/15 text-primary border-primary/20">
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          Completed
        </Badge>
      );
    case "processing":
      return (
        <Badge className="bg-cp-amber/15 text-cp-amber border-cp-amber/20">
          <Clock className="mr-1.5 h-3.5 w-3.5" />
          Processing
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-destructive/15 text-destructive border-destructive/20">
          <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
          Failed
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

// Generate a deterministic cert ID from batch id + recipient index
function deriveCertId(batchId: string, index: number): string {
  return `${batchId.slice(0, 8)}-${index.toString().padStart(4, "0")}`;
}

export function BatchDetailPage() {
  const { batchId } = useParams({ from: "/auth/batches/$batchId" }) as { batchId: string };
  const { data: batch, isLoading } = useGetBatch(batchId);
  const [downloading, setDownloading] = useState(false);

  const handleCopyShareLink = (certId: string) => {
    const url = `${window.location.origin}/cert/${certId}`;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied to clipboard!");
  };

  const handleDownloadAll = async () => {
    if (!batch) return;
    setDownloading(true);
    try {
      const certData = (batch.certificates || []).map((cert: any, i: number) => ({
        certId: cert.id,
        batchId: batch.id,
        batchName: batch.name,
        recipientName: cert.recipientName,
        recipientEmail: cert.recipientEmail,
        fields: cert.customFields,
        shareUrl: `${window.location.origin}/cert/${cert.id}`,
        verifyUrl: `${window.location.origin}/verify?code=${cert.uniqueCode}`,
      }));

      const blob = new Blob([JSON.stringify(certData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${batch.name.replace(/\s+/g, "_")}_certificates.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(
        `Downloaded certificate data for ${batch.recipients.length} recipients`,
      );
    } catch {
      toast.error("Failed to download certificate data");
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-3 gap-5 mb-8">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </main>
    );
  }

  if (!batch) {
    return (
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-center">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display font-bold text-xl mb-2">Batch not found</h2>
        <p className="text-muted-foreground mb-4">
          This batch may have been deleted or you don&apos;t have access.
        </p>
        <Button asChild variant="outline">
          <Link to="/batches">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Batches
          </Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          >
            <Link to="/batches">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Batches
            </Link>
          </Button>
          <div className="w-px h-4 bg-border" />
          <div>
            <motion.h1
              className="font-display text-2xl font-bold leading-tight"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {batch.name}
            </motion.h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(batch.status)}
              <span className="text-xs text-muted-foreground font-mono">
                {new Date(batch.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleDownloadAll}
          disabled={downloading}
          className="hidden sm:flex"
        >
          <Download className="mr-2 h-4 w-4" />
          {downloading ? "Exporting…" : "Export Data"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          className="rounded-xl border border-border bg-card p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <p className="text-xs text-muted-foreground mb-1">Certificates</p>
          <p className="font-display text-2xl font-bold flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" />
            {batch.certificates?.length || 0}
          </p>
        </motion.div>

        <motion.div
          className="rounded-xl border border-border bg-card p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <p className="text-xs text-muted-foreground mb-1">Template</p>
          <p className="font-display text-sm font-semibold truncate">
            {batch.template?.name ?? `${batch.templateId.slice(0, 8)}…`}
          </p>
        </motion.div>

        <motion.div
          className="rounded-xl border border-border bg-card p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs text-muted-foreground mb-1">Status</p>
          <div className="mt-0.5">{getStatusBadge(batch.status)}</div>
        </motion.div>

        <motion.div
          className="rounded-xl border border-border bg-card p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-xs text-muted-foreground mb-1">Batch ID</p>
          <p className="font-mono text-xs text-muted-foreground">
            {batch.id.slice(0, 12)}…
          </p>
        </motion.div>
      </div>

      {/* Recipients table */}
      <motion.div
        className="rounded-xl border border-border bg-card overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-display font-semibold text-base">Issued Certificates</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {(batch.certificates || []).length} certificate
              {(batch.certificates || []).length !== 1 ? "s" : ""} generated
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadAll}
            disabled={downloading}
            className="sm:hidden"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export
          </Button>
        </div>

        {(!batch.certificates || batch.certificates.length === 0) ? (
          <div className="text-center py-12">
            <Award className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No certificates generated in this batch
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batch.certificates.map((cert: any, i: number) => {
                  return (
                    <TableRow key={cert.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {cert.recipientName || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {cert.recipientEmail || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-5">
                          {cert.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopyShareLink(cert.id)}
                            title="Copy share link"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="View certificate"
                          >
                            <Link to="/cert/$certId" params={{ certId: cert.id }}>
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              const url = `${window.location.origin}/cert/${cert.id}`;
                              window.open(url, "_blank");
                            }}
                            title="Open certificate page"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              const verifyUrl = `${window.location.origin}/verify?code=${cert.uniqueCode}`;
                              window.open(verifyUrl, "_blank");
                            }}
                            title="Verify certificate"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
    </main>
  );
}
