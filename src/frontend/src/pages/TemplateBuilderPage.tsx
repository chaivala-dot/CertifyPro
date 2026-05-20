import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Award,
  Image as ImageIcon,
  Loader2,
  Plus,
  QrCode,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { FieldDefinition } from "../backend.d";
import {
  useCreateTemplate,
  useGetTemplate,
  useUpdateTemplate,
} from "../hooks/useQueries";
import { useTemplateStore } from "../store/templateStore";
import { CertificateConfig, DEFAULT_CONFIG, LayoutType, BorderStyle, SealType } from "../types/certificate";
import { CertificatePreview } from "../components/certificate/CertificatePreview";

const DEFAULT_FIELDS: FieldDefinition[] = [
  { fieldName: "recipientName", fieldType: "text", required: true },
  { fieldName: "courseTitle", fieldType: "text", required: false },
  { fieldName: "issueDate", fieldType: "date", required: false },
  { fieldName: "issuedBy", fieldType: "text", required: false },
];

interface TemplateBuilderPageProps {
  mode: "create" | "edit";
  templateId?: string;
}



export function TemplateBuilderPage({
  mode,
  templateId,
}: TemplateBuilderPageProps) {
  const navigate = useNavigate();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const addToStore = useTemplateStore((s) => s.addTemplate);
  const updateInStore = useTemplateStore((s) => s.updateTemplate);

  const { data: templateData, isLoading: loadingExisting } = useGetTemplate(
    mode === "edit" && templateId ? templateId : "__prefetch__",
  );

  const parsedCanvas = (() => {
    const raw = (templateData as any)?.canvasStateJson;
    if (typeof raw !== "string") return null;
    try {
      return JSON.parse(raw) as any;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (mode !== "edit" || !templateData) return;

    setName((templateData as any).name ?? "");

    const bg = (templateData as any)?.backgroundUrl;
    if (typeof bg === "string") {
      setBackgroundUrl(bg);
    }

    const desc = parsedCanvas?.description;
    if (typeof desc === "string") {
      setDescription(desc);
    }

    const f = parsedCanvas?.fields;
    if (Array.isArray(f)) {
      setFields(f);
    }

    const lg = parsedCanvas?.logoUrl;
    if (typeof lg === "string") {
      setLogoUrl(lg);
    }

    if (parsedCanvas?.config) {
      setConfig(parsedCanvas.config);
    }
  }, [mode, templateData]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FieldDefinition[]>(DEFAULT_FIELDS);
  const [config, setConfig] = useState<CertificateConfig>(DEFAULT_CONFIG);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [initialized, setInitialized] = useState(false);

  const bgInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleAddField = () => {
    if (!newFieldName.trim()) return;
    if (fields.find((f) => f.fieldName === newFieldName.trim())) {
      toast.error("A field with this name already exists");
      return;
    }
    setFields((prev) => [
      ...prev,
      {
        fieldName: newFieldName.trim(),
        fieldType: newFieldType,
        required: newFieldRequired,
      },
    ]);
    setNewFieldName("");
    setNewFieldType("text");
    setNewFieldRequired(false);
  };

  const handleRemoveField = (fieldName: string) => {
    setFields((prev) => prev.filter((f) => f.fieldName !== fieldName));
  };

  const handleToggleRequired = (fieldName: string) => {
    setFields((prev) =>
      prev.map((f) =>
        f.fieldName === fieldName ? { ...f, required: !f.required } : f,
      ),
    );
  };

  const handleFileChange = useCallback(
    (file: File | null, type: "background" | "logo") => {
      if (!file) return;
      const url = URL.createObjectURL(file);
      if (type === "background") {
        setBackgroundFile(file);
        setBackgroundUrl(url);
      } else {
        setLogoFile(file);
        setLogoUrl(url);
      }
    },
    [],
  );

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    if (fields.length === 0) {
      toast.error("Please add at least one field");
      return;
    }

    try {
      if (mode === "create") {
        const created = await createTemplate.mutateAsync({
          name: name.trim(),
          backgroundUrl: backgroundUrl || null,
          canvasStateJson: {
            description: description.trim(),
            fields,
            logoUrl: logoUrl || null,
            config,
          },
        });
        addToStore({
          id: created.id,
          name: created.name,
          description: description.trim(),
          fields,
          backgroundImage: {} as never,
          logoImage: {} as never,
          owner: {} as never,
        });
        toast.success("Template created successfully!");
        navigate({ to: "/templates" });
      } else if (templateId) {
        await updateTemplate.mutateAsync({
          id: templateId,
          name: name.trim(),
          backgroundUrl: backgroundUrl || null,
          canvasStateJson: {
            description: description.trim(),
            fields,
            logoUrl: logoUrl || null,
            config,
          },
        });
        updateInStore({
          id: templateId,
          name: name.trim(),
          description: description.trim(),
          fields,
          backgroundImage: {} as never,
          logoImage: {} as never,
          owner: {} as never,
        });
        toast.success("Template updated successfully!");
        navigate({ to: "/templates" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save template. Please try again.");
    }
    setUploadProgress(0);
  };

  const isSaving = createTemplate.isPending || updateTemplate.isPending;

  if (mode === "edit" && loadingExisting) {
    return (
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-[1.414/1] rounded-xl" />
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          >
            <Link to="/templates">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Templates
            </Link>
          </Button>
          <div className="w-px h-4 bg-border" />
          <motion.h1
            className="font-display text-2xl font-bold"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {mode === "create" ? "New Template" : "Edit Template"}
          </motion.h1>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="shadow-glow"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploadProgress > 0 && uploadProgress < 100
                ? `Uploading ${uploadProgress}%…`
                : "Saving…"}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Template
            </>
          )}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left: Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:sticky lg:top-24"
        >
          <h2 className="font-display font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">
            Live Preview
          </h2>
          <CertificatePreview
            name={name}
            description={description}
            fields={fields}
            backgroundUrl={backgroundUrl}
            logoUrl={logoUrl}
            config={config}
          />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Preview updates as you configure the template
          </p>
        </motion.div>

        {/* Configuration */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Basic info */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-display font-semibold text-base">
              Basic Information
            </h2>

            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                placeholder="e.g. Course Completion Certificate"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-desc">Description</Label>
              <Textarea
                id="template-desc"
                placeholder="Brief description of this certificate template…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Design Configuration */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <h2 className="font-display font-semibold text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Design Configuration
            </h2>

            <div className="grid grid-cols-2 gap-6">
              {/* Layout */}
              <div className="space-y-2">
                <Label>Layout Style</Label>
                <Select
                  value={config.layout}
                  onValueChange={(v: LayoutType) => setConfig(prev => ({ ...prev, layout: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="centered">Centered (Classic)</SelectItem>
                    <SelectItem value="classic">Spaced (Formal)</SelectItem>
                    <SelectItem value="modern">Reverse (Modern)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Border */}
              <div className="space-y-2">
                <Label>Border Style</Label>
                <Select
                  value={config.borderStyle}
                  onValueChange={(v: BorderStyle) => setConfig(prev => ({ ...prev, borderStyle: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="simple">Simple Line</SelectItem>
                    <SelectItem value="double">Double Line</SelectItem>
                    <SelectItem value="ornate">Premium Ornate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title Font */}
              <div className="space-y-2">
                <Label>Title Typography</Label>
                <Select
                  value={config.titleFont}
                  onValueChange={(v) => setConfig(prev => ({ ...prev, titleFont: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serif">Elegant Serif</SelectItem>
                    <SelectItem value="sans">Modern Sans</SelectItem>
                    <SelectItem value="mono">Technical Mono</SelectItem>
                    <SelectItem value="display">Bold Display</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Body Font */}
              <div className="space-y-2">
                <Label>Body Typography</Label>
                <Select
                  value={config.bodyFont}
                  onValueChange={(v) => setConfig(prev => ({ ...prev, bodyFont: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="sans">Sans-serif</SelectItem>
                    <SelectItem value="mono">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="show-seal"
                  checked={config.showSeal}
                  onCheckedChange={(v) => setConfig(prev => ({ ...prev, showSeal: v }))}
                />
                <Label htmlFor="show-seal">Add Official Seal</Label>
              </div>

              {config.showSeal && (
                <Select
                  value={config.sealType}
                  onValueChange={(v: SealType) => setConfig(prev => ({ ...prev, sealType: v }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gold">Gold Seal</SelectItem>
                    <SelectItem value="silver">Silver Seal</SelectItem>
                    <SelectItem value="bronze">Bronze Seal</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Signature Management */}
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Signature Lines</Label>
              <div className="space-y-3">
                {config.signatures.map((sig, idx) => (
                  <div key={idx} className="flex gap-2 items-end bg-secondary/20 p-3 rounded-lg border border-border">
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px]">Title (e.g. CEO)</Label>
                      <Input
                        value={sig.title}
                        onChange={(e) => {
                          const newSigs = [...config.signatures];
                          newSigs[idx].title = e.target.value;
                          setConfig(prev => ({ ...prev, signatures: newSigs }));
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px]">Name (Optional)</Label>
                      <Input
                        value={sig.name}
                        onChange={(e) => {
                          const newSigs = [...config.signatures];
                          newSigs[idx].name = e.target.value;
                          setConfig(prev => ({ ...prev, signatures: newSigs }));
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => {
                        const newSigs = config.signatures.filter((_, i) => i !== idx);
                        setConfig(prev => ({ ...prev, signatures: newSigs }));
                      }}
                      disabled={config.signatures.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs border-dashed"
                  onClick={() => setConfig(prev => ({
                    ...prev,
                    signatures: [...prev.signatures, { title: "New Signatory", name: "" }]
                  }))}
                  disabled={config.signatures.length >= 3}
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Signature Line
                </Button>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-display font-semibold text-base">Images</h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Background */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Background Image
                </Label>
                <button
                  type="button"
                  onClick={() => bgInputRef.current?.click()}
                  className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/40 bg-secondary/30 flex flex-col items-center justify-center gap-2 transition-colors text-muted-foreground hover:text-foreground text-xs relative overflow-hidden"
                >
                  {backgroundUrl ? (
                    <img
                      src={backgroundUrl}
                      alt="Background preview"
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                  ) : null}
                  <div className="relative z-10">
                    <ImageIcon className="h-5 w-5 mx-auto mb-1" />
                    <span>{backgroundUrl ? "Change" : "Upload"}</span>
                  </div>
                </button>
                <input
                  ref={bgInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileChange(e.target.files?.[0] ?? null, "background")
                  }
                />
              </div>

              {/* Logo */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Logo
                </Label>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/40 bg-secondary/30 flex flex-col items-center justify-center gap-2 transition-colors text-muted-foreground hover:text-foreground text-xs relative overflow-hidden"
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="absolute inset-0 w-full h-full object-contain p-2"
                    />
                  ) : null}
                  <div className="relative z-10">
                    <Upload className="h-5 w-5 mx-auto mb-1" />
                    <span>{logoUrl ? "Change" : "Upload"}</span>
                  </div>
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileChange(e.target.files?.[0] ?? null, "logo")
                  }
                />
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-base">
                Certificate Fields
              </h2>
              <Badge variant="secondary" className="font-mono text-xs">
                {fields.length} fields
              </Badge>
            </div>

            {/* Existing fields */}
            <div className="space-y-2">
              {fields.map((field) => (
                <div
                  key={field.fieldName}
                  className="flex items-center gap-3 rounded-lg bg-secondary/30 border border-border px-3 py-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-foreground">
                        {field.fieldName}
                      </span>
                      {field.required && (
                        <span className="text-[10px] text-primary font-medium">
                          required
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {field.fieldType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={field.required}
                      onCheckedChange={() =>
                        handleToggleRequired(field.fieldName)
                      }
                      className="scale-75"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveField(field.fieldName)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add field */}
            <div className="rounded-lg border border-dashed border-border p-3 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">
                Add New Field
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="fieldName"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="font-mono text-sm flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleAddField()}
                />
                <Select value={newFieldType} onValueChange={setNewFieldType}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="new-field-required"
                    checked={newFieldRequired}
                    onCheckedChange={setNewFieldRequired}
                  />
                  <Label
                    htmlFor="new-field-required"
                    className="text-xs cursor-pointer"
                  >
                    Required
                  </Label>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddField}
                  disabled={!newFieldName.trim()}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Field
                </Button>
              </div>
            </div>
          </div>

          {/* Save */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full shadow-glow"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Template
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </main>
  );
}

