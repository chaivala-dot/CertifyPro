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
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Package,
  Plus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../hooks/useAuth";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="font-display text-3xl font-bold">{value}</p>
        </div>
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return (
        <Badge className="bg-primary/15 text-primary border-primary/20 hover:bg-primary/20">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      );
    case "processing":
      return (
        <Badge className="bg-cp-amber/15 text-cp-amber border-cp-amber/20 hover:bg-cp-amber/20">
          <Clock className="mr-1 h-3 w-3" />
          Processing
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-destructive/15 text-destructive border-destructive/20 hover:bg-destructive/20">
          <AlertCircle className="mr-1 h-3 w-3" />
          Failed
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function DashboardPage() {
  const { user: profile } = useAuth();
  const stats = { templatesCount: 3n, batchesCount: 5n, certificatesIssued: 150n };
  const statsLoading = false;

  // Minimal mock data for UI visual
  const batches: any[] = [
    { id: "1", name: "Q1 Course Completion", recipients: Array(120), status: "completed", created: BigInt(Date.now()) * 1000000n }
  ];
  const batchesLoading = false;

  const recentBatches = batches?.slice(0, 5) ?? [];

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <motion.h1
            className="font-display text-3xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {profile?.name ? `Welcome back, ${profile.name}` : "Dashboard"}
          </motion.h1>
          <motion.p
            className="text-muted-foreground mt-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            Manage your certificates, templates, and batches
          </motion.p>
        </div>

        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button asChild variant="outline" size="sm">
            <Link to="/templates/new">
              <Plus className="mr-1.5 h-4 w-4" />
              New Template
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/batches/new">
              <Plus className="mr-1.5 h-4 w-4" />
              New Batch
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-5 mb-10">
        {statsLoading ? (
          <>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-6"
              >
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </>
        ) : (
          <>
            <StatCard
              icon={FileText}
              label="Templates"
              value={stats ? Number(stats.templatesCount) : 0}
              color="bg-primary/10 text-primary"
              delay={0}
            />
            <StatCard
              icon={Package}
              label="Batches"
              value={stats ? Number(stats.batchesCount) : 0}
              color="bg-cp-purple/10 text-cp-purple"
              delay={0.05}
            />
            <StatCard
              icon={Award}
              label="Certificates Issued"
              value={stats ? Number(stats.certificatesIssued) : 0}
              color="bg-cp-amber/10 text-cp-amber"
              delay={0.1}
            />
          </>
        )}
      </div>

      {/* Recent batches */}
      <motion.div
        className="rounded-xl border border-border bg-card overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-display font-semibold text-lg">
              Recent Batches
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your latest certificate generation batches
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/batches">
              View all <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {batchesLoading ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : recentBatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-base mb-1">
              No batches yet
            </h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs">
              Create a template first, then upload a CSV to generate your first
              batch of certificates.
            </p>
            <Button asChild size="sm">
              <Link to="/batches/new">
                <Plus className="mr-1.5 h-4 w-4" />
                Create First Batch
              </Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Name</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBatches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.name}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {batch.recipients.length}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(batch.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {new Date(
                      Number(batch.created) / 1_000_000,
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link
                        to="/batches/$batchId"
                        params={{ batchId: batch.id }}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-5 mt-5">
        <motion.div
          className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold mb-1">
                Build a Template
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Design a reusable certificate template with custom fields,
                branding, and layout.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/templates">
                  Manage Templates{" "}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl border border-border bg-card p-6 hover:border-cp-purple/40 transition-colors group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-cp-purple/10 border border-cp-purple/20 flex items-center justify-center flex-shrink-0">
              <Package className="h-5 w-5 text-cp-purple" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold mb-1">
                Generate Certificates
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a CSV file and generate certificates for all recipients
                in one batch.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/batches/new">
                  New Batch{" "}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
