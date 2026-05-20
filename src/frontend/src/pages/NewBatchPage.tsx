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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  FileSpreadsheet,
  Loader2,
  Upload,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type {
  CertificateTemplate,
  FieldDefinition,
  Recipient,
} from "../backend.d";
import { useCreateBatch } from "../hooks/useQueries";
import { useTemplateStore } from "../store/templateStore";

type Step = 1 | 2 | 3;

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map(parseRow);
  return { headers, rows };
}

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps = [
    { n: 1, label: "Select Template" },
    { n: 2, label: "Upload CSV" },
    { n: 3, label: "Confirm" },
  ];

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => (
        <div key={step.n} className="flex items-center">
          <div
            className={`flex items-center gap-2 ${currentStep === step.n
              ? "text-foreground"
              : step.n < currentStep
                ? "text-primary"
                : "text-muted-foreground"
              }`}
          >
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-colors ${currentStep === step.n
                ? "bg-primary text-primary-foreground border-primary"
                : step.n < currentStep
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "bg-secondary border-border"
                }`}
            >
              {step.n < currentStep ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                step.n
              )}
            </div>
            <span className="text-xs font-medium hidden sm:block">
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className="h-4 w-4 text-border mx-2" />
          )}
        </div>
      ))}
    </div>
  );
}

export function NewBatchPage() {
  const navigate = useNavigate();
  const createBatch = useCreateBatch();
  const templates = useTemplateStore((s) => s.templates);

  const [step, setStep] = useState<Step>(1);
  const [selectedTemplate, setSelectedTemplate] =
    useState<CertificateTemplate | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>(
    {},
  );
  const [batchName, setBatchName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleCSVFile = useCallback(
    (file: File) => {
      if (!file.name.match(/\.(csv|txt)$/i) && file.type !== "text/csv") {
        toast.error("Please upload a CSV file");
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const { headers, rows } = parseCSV(text);
        setCsvHeaders(headers);
        setCsvRows(rows);

        // Auto-map name and email
        const autoMap: Record<string, string> = {};
        const nameMatch = headers.find((h) =>
          h.toLowerCase().replace(/\s/g, "").includes("name"),
        );
        if (nameMatch) autoMap.recipientName = nameMatch;

        const emailMatch = headers.find((h) =>
          h.toLowerCase().replace(/\s/g, "").includes("email"),
        );
        if (emailMatch) autoMap.email = emailMatch;

        if (selectedTemplate) {
          for (const field of selectedTemplate.fields) {
            const match = headers.find(
              (h) =>
                h.toLowerCase().replace(/\s/g, "") ===
                field.fieldName.toLowerCase().replace(/\s/g, ""),
            );
            if (match) autoMap[field.fieldName] = match;
          }
        }
        setColumnMapping(autoMap);
      };
      reader.readAsText(file);
    },
    [selectedTemplate],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleCSVFile(file);
    },
    [handleCSVFile],
  );

  const getPreviewRecipients = (): Recipient[] => {
    const nameCol = columnMapping.recipientName || csvHeaders[0];
    const emailCol = columnMapping.email || "";

    return csvRows.slice(0, 5).map((row) => {
      const nameIdx = csvHeaders.indexOf(nameCol);
      const emailIdx = emailCol ? csvHeaders.indexOf(emailCol) : -1;

      const name = nameIdx >= 0 ? (row[nameIdx] ?? "") : "";
      const email = emailIdx >= 0 ? (row[emailIdx] ?? "") : "";

      const fieldValues: [string, string][] = [];
      if (selectedTemplate) {
        for (const field of selectedTemplate.fields) {
          const col = columnMapping[field.fieldName];
          if (col) {
            const idx = csvHeaders.indexOf(col);
            if (idx >= 0) {
              fieldValues.push([field.fieldName, row[idx] ?? ""]);
            }
          }
        }
      }

      return { name, email, fieldValues };
    });
  };

  const getAllRecipients = (): Recipient[] => {
    const nameCol = columnMapping.recipientName || csvHeaders[0];
    const emailCol = columnMapping.email || "";

    return csvRows.map((row) => {
      const nameIdx = csvHeaders.indexOf(nameCol);
      const emailIdx = emailCol ? csvHeaders.indexOf(emailCol) : -1;

      const name = nameIdx >= 0 ? (row[nameIdx] ?? "") : "";
      const email = emailIdx >= 0 ? (row[emailIdx] ?? "") : "";

      const fieldValues: [string, string][] = [];
      if (selectedTemplate) {
        for (const field of selectedTemplate.fields) {
          const col = columnMapping[field.fieldName];
          if (col) {
            const idx = csvHeaders.indexOf(col);
            if (idx >= 0) {
              fieldValues.push([field.fieldName, row[idx] ?? ""]);
            }
          }
        }
      }

      return { name, email, fieldValues };
    });
  };

  const handleCreate = async () => {
    if (!batchName.trim()) {
      toast.error("Please enter a batch name");
      return;
    }
    if (!selectedTemplate) return;

    try {
      const recipients = getAllRecipients();
      const created = await createBatch.mutateAsync({
        name: batchName.trim(),
        templateId: selectedTemplate.id,
        recipients,
      });
      toast.success(
        `Batch "${batchName}" created with ${recipients.length} recipients!`,
      );
      navigate({ to: "/batches/$batchId", params: { batchId: created.id } });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create batch. Please try again.");
    }
  };

  const previewRecipients = csvRows.length > 0 ? getPreviewRecipients() : [];

  return (
    <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
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
          <h1 className="font-display text-2xl font-bold">New Batch</h1>
        </div>
        <StepIndicator currentStep={step} />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select template */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display font-semibold text-lg mb-1">
                Select a Template
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Choose the certificate template to use for this batch
              </p>

              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium mb-1">No templates available</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a template first before generating certificates.
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/templates/new">Create Template</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <button
                      type="button"
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`text-left rounded-xl border-2 p-4 transition-all hover:-translate-y-0.5 ${selectedTemplate?.id === template.id
                        ? "border-primary bg-primary/5 shadow-glow"
                        : "border-border hover:border-primary/40"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedTemplate?.id === template.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                            }`}
                        >
                          {selectedTemplate?.id === template.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <FileSpreadsheet className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-semibold text-sm">
                            {template.name}
                          </p>
                          {template.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {template.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {template.fields.slice(0, 3).map((f) => (
                              <span
                                key={f.fieldName}
                                className="text-[10px] font-mono bg-secondary text-muted-foreground rounded px-1.5 py-0.5"
                              >
                                {f.fieldName}
                              </span>
                            ))}
                            {template.fields.length > 3 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{template.fields.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setStep(2)} disabled={!selectedTemplate}>
                Next: Upload CSV <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Upload CSV */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display font-semibold text-lg mb-1">
                Upload CSV File
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Upload a CSV with recipient data. First row should be column
                headers.
              </p>

              {/* Drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative rounded-xl border-2 border-dashed p-10 text-center transition-all ${isDragging
                  ? "border-primary bg-primary/10"
                  : csvRows.length > 0
                    ? "border-primary/40 bg-primary/5"
                    : "border-border hover:border-primary/40"
                  }`}
              >
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCSVFile(file);
                  }}
                />

                {csvRows.length > 0 ? (
                  <div className="space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center mx-auto">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-medium text-primary">{fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {csvRows.length} rows · {csvHeaders.length} columns
                      detected
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click to replace file
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mx-auto">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Drop your CSV here</p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supports .csv and .txt files
                    </p>
                  </div>
                )}
              </div>

              {/* Column mapping */}
              {csvHeaders.length > 0 && selectedTemplate && (
                <div className="mt-6">
                  <h3 className="font-display font-semibold text-sm mb-1">
                    Map CSV Columns to Template Fields
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Tell us which CSV column corresponds to each template field
                  </p>

                  <div className="space-y-3">
                    {/* Primary fields: Name and Email */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-40 flex-shrink-0">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span className="font-semibold text-sm">Recipient Name *</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Select
                        value={columnMapping.recipientName || csvHeaders[0]}
                        onValueChange={(val) =>
                          setColumnMapping((prev) => ({
                            ...prev,
                            recipientName: val,
                          }))
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select name column…" />
                        </SelectTrigger>
                        <SelectContent>
                          {csvHeaders.map((h) => (
                            <SelectItem key={h} value={h}>
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-40 flex-shrink-0">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-semibold text-sm">Email Address</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Select
                        value={columnMapping.email || "__none__"}
                        onValueChange={(val) =>
                          setColumnMapping((prev) => ({
                            ...prev,
                            email: val === "__none__" ? "" : val,
                          }))
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select email column…" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— Not in CSV —</SelectItem>
                          {csvHeaders.map((h) => (
                            <SelectItem key={h} value={h}>
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="h-px bg-border my-2" />

                    {selectedTemplate.fields.map((field: FieldDefinition) => (
                      <div
                        key={field.fieldName}
                        className="flex items-center gap-4"
                      >
                        <div className="flex items-center gap-2 w-40 flex-shrink-0">
                          <span className="font-mono text-sm text-foreground">
                            {field.fieldName}
                          </span>
                          {field.required && (
                            <span className="text-[10px] text-primary">*</span>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <Select
                          value={columnMapping[field.fieldName] ?? "__none__"}
                          onValueChange={(val) =>
                            setColumnMapping((prev) => ({
                              ...prev,
                              [field.fieldName]: val === "__none__" ? "" : val,
                            }))
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select column…" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">
                              — Not mapped —
                            </SelectItem>
                            {csvHeaders.map((h) => (
                              <SelectItem key={h} value={h}>
                                {h}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview table */}
            {previewRecipients.length > 0 && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-display font-semibold text-sm">
                    Preview (first 5 rows)
                  </h3>
                  <Badge variant="secondary" className="font-mono">
                    {csvRows.length} total
                  </Badge>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        {selectedTemplate?.fields.slice(0, 3).map((f) => (
                          <TableHead key={f.fieldName}>{f.fieldName}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewRecipients.map((r, i) => (
                        <TableRow key={`preview-${i}-${r.name}`}>
                          <TableCell className="font-medium">
                            {r.name || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {r.email || "—"}
                          </TableCell>
                          {selectedTemplate?.fields.slice(0, 3).map((f) => (
                            <TableCell key={f.fieldName} className="text-sm">
                              {r.fieldValues.find(
                                ([k]) => k === f.fieldName,
                              )?.[1] ?? "—"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={csvRows.length === 0}
              >
                Next: Confirm <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="font-display font-semibold text-lg">
                Confirm Batch
              </h2>

              <div className="space-y-2">
                <Label htmlFor="batch-name">Batch Name *</Label>
                <Input
                  id="batch-name"
                  placeholder="e.g. Spring 2026 Graduates"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                />
              </div>

              {/* Summary */}
              <div className="rounded-lg bg-secondary/50 border border-border p-4 space-y-3">
                <h3 className="text-sm font-medium">Batch Summary</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Template</p>
                    <p className="font-medium">{selectedTemplate?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Recipients</p>
                    <p className="font-medium flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      {csvRows.length} people
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Fields mapped
                    </p>
                    <p className="font-medium">
                      {Object.values(columnMapping).filter(Boolean).length} /{" "}
                      {selectedTemplate?.fields.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">File</p>
                    <p className="font-medium truncate">{fileName}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Generating {csvRows.length} certificates using the &quot;
                {selectedTemplate?.name}&quot; template. Recipients will be
                assigned unique verification codes.
              </p>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createBatch.isPending || !batchName.trim()}
                className="shadow-glow"
              >
                {createBatch.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    Generate {csvRows.length} Certificates
                    <Check className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
