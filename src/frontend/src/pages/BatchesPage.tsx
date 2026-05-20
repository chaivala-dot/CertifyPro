import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  MoreHorizontal,
  Package,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import { useListBatches, useDeleteBatch } from "../hooks/useQueries";


function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return (
        <Badge className="bg-primary/15 text-primary border-primary/20">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      );
    case "processing":
      return (
        <Badge className="bg-cp-amber/15 text-cp-amber border-cp-amber/20">
          <Clock className="mr-1 h-3 w-3" />
          Processing
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-destructive/15 text-destructive border-destructive/20">
          <AlertCircle className="mr-1 h-3 w-3" />
          Failed
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function BatchRowActions({
  batchId,
  batchName,
}: { batchId: string; batchName: string }) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteBatch = useDeleteBatch();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBatch.mutateAsync(batchId);
      toast.success(`Batch "${batchName}" deleted`);
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete batch");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              to="/batches/$batchId"
              params={{ batchId }}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                setOpen(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Batch</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{batchName}&quot;? All
            associated certificates will be deleted. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function BatchesPage() {
  const { data: batches = [], isLoading } = useListBatches();

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <motion.h1
            className="font-display text-3xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Certificate Batches
          </motion.h1>
          <motion.p
            className="text-muted-foreground mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
          >
            View and manage your bulk certificate generation jobs
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button asChild>
            <Link to="/batches/new">
              <Plus className="mr-1.5 h-4 w-4" />
              New Batch
            </Link>
          </Button>
        </motion.div>
      </div>

      <motion.div
        className="rounded-xl border border-border bg-card overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !batches || batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="h-16 w-16 rounded-2xl bg-cp-purple/10 border border-cp-purple/20 flex items-center justify-center mb-5">
              <Package className="h-7 w-7 text-cp-purple" />
            </div>
            <h2 className="font-display font-bold text-xl mb-2">
              No batches yet
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Create a certificate template, then generate a batch by uploading
              a CSV file.
            </p>
            <Button asChild>
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
                <TableHead>Template</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>
                    <Link
                      to="/batches/$batchId"
                      params={{ batchId: batch.id }}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {batch.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {batch.template?.name || "No Template"}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {batch.certificates?.length || 0}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(batch.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {new Date(batch.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <BatchRowActions
                      batchId={batch.id}
                      batchName={batch.name}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </main>
  );
}
