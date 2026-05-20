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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  FileText,
  Hash,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Type,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useDeleteTemplate, useGetTemplate } from "../hooks/useQueries";
import { useTemplateStore } from "../store/templateStore";

function TemplateCardActions({
  templateId,
  templateName,
}: {
  templateId: string;
  templateName: string;
}) {
  const deleteTemplate = useDeleteTemplate();
  const removeFromStore = useTemplateStore((s) => s.removeTemplate);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteTemplate.mutateAsync(templateId);
      removeFromStore(templateId);
      toast.success(`Template "${templateName}" deleted`);
    } catch {
      toast.error("Failed to delete template");
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
              to="/templates/$templateId/edit"
              params={{ templateId }}
              className="cursor-pointer"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
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
          <AlertDialogTitle>Delete Template</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{templateName}&quot;? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteTemplate.isPending}
          >
            {deleteTemplate.isPending ? (
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

function getFieldIcon(type: string) {
  switch (type) {
    case "date":
      return <CalendarDays className="h-3 w-3" />;
    case "number":
      return <Hash className="h-3 w-3" />;
    default:
      return <Type className="h-3 w-3" />;
  }
}

export function TemplatesPage() {
  const templates = useTemplateStore((s) => s.templates);
  const { data: _, isLoading: _l } = useGetTemplate("__prefetch__");

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <motion.h1
            className="font-display text-3xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Certificate Templates
          </motion.h1>
          <motion.p
            className="text-muted-foreground mt-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
          >
            Design and manage reusable certificate layouts
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button asChild>
            <Link to="/templates/new">
              <Plus className="mr-1.5 h-4 w-4" />
              New Template
            </Link>
          </Button>
        </motion.div>
      </div>

      {templates.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-display font-bold text-xl mb-2">
            No templates yet
          </h2>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            Create your first certificate template with custom fields, branding,
            and a background image.
          </p>
          <Button asChild>
            <Link to="/templates/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Create First Template
            </Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((template, i) => (
            <motion.div
              key={template.id}
              className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all duration-200 hover:-translate-y-0.5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {/* Preview area */}
              <div className="aspect-[1.414/1] relative bg-gradient-to-br from-slate-50/5 to-slate-100/5 border-b border-border overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4/5 h-4/5 rounded-lg border border-muted/20 bg-muted/5 flex items-center justify-center">
                    <div className="text-center space-y-1 p-4">
                      <div className="h-0.5 w-16 bg-primary/20 mx-auto mb-3" />
                      <div className="font-serif text-lg text-foreground/40 italic">
                        {template.name}
                      </div>
                      <div className="h-0.5 w-10 bg-muted/20 mx-auto" />
                    </div>
                  </div>
                </div>

                {/* Background image */}
                {template.backgroundImage?.getDirectURL?.() && (
                  <img
                    src={template.backgroundImage.getDirectURL()}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <TemplateCardActions
                    templateId={template.id}
                    templateName={template.name}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display font-semibold text-base leading-tight">
                    {template.name}
                  </h3>
                  <TemplateCardActions
                    templateId={template.id}
                    templateName={template.name}
                  />
                </div>
                {template.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {template.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {template.fields.map((field) => (
                    <span
                      key={field.fieldName}
                      className="inline-flex items-center gap-1 text-[10px] font-mono bg-secondary text-muted-foreground rounded px-1.5 py-0.5"
                    >
                      {getFieldIcon(field.fieldType)}
                      {field.fieldName}
                      {field.required && (
                        <span className="text-primary/70">*</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div className="px-4 pb-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link
                    to="/templates/$templateId/edit"
                    params={{ templateId: template.id }}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit Template
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}

          {/* Add card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: templates.length * 0.05 }}
          >
            <Link
              to="/templates/new"
              className="block rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 aspect-card group"
            >
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3 text-center p-6">
                <div className="h-10 w-10 rounded-lg border-2 border-dashed border-border group-hover:border-primary/40 flex items-center justify-center transition-colors">
                  <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="font-display font-medium text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    New Template
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      )}
    </main>
  );
}
