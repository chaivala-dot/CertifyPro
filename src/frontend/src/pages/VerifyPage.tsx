import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useSearch } from "@tanstack/react-router";
import {
  Award,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Loader2,
  QrCode,
  Search,
  User,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Certificate } from "../backend.d";
import { useVerifyCertificate } from "../hooks/useQueries";

export function VerifyPage() {
  const search = useSearch({ from: "/verify" });
  const initialCode = search.code ?? "";

  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<Certificate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const verifyCert = useVerifyCertificate();

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode ?? code;
    if (!codeToVerify.trim()) return;

    setResult(null);
    setError(null);

    try {
      const cert = await verifyCert.mutateAsync(codeToVerify.trim());
      setResult(cert);
    } catch {
      setError(
        "Certificate not found or invalid verification code. Please check the code and try again.",
      );
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

  return (
    <main className="relative z-10 min-h-screen px-4">
      {/* Hero */}
      <section className="py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-mono text-primary mb-6">
            <QrCode className="h-3.5 w-3.5" />
            Certificate Verification
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Verify a Certificate
          </h1>
          <p className="text-muted-foreground text-lg mb-10">
            Enter the certificate ID or scan the QR code to instantly verify
            authenticity.
          </p>

          {/* Search form */}
          <div className="flex gap-3 max-w-lg mx-auto">
            <div className="flex-1">
              <Label htmlFor="verify-code" className="sr-only">
                Verification Code
              </Label>
              <Input
                id="verify-code"
                placeholder="Enter certificate ID or code…"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                className="font-mono h-11"
              />
            </div>
            <Button
              onClick={() => handleVerify()}
              disabled={verifyCert.isPending || !code.trim()}
              className="h-11 px-6 shadow-glow"
            >
              {verifyCert.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Verify</span>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Results */}
      <AnimatePresence mode="wait">
        {verifyCert.isPending && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-8"
          >
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Verifying certificate…</span>
            </div>
          </motion.div>
        )}

        {error && !verifyCert.isPending && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mx-auto max-w-lg"
          >
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
              <XCircle className="h-14 w-14 text-destructive mx-auto mb-4" />
              <h2 className="font-display font-bold text-xl mb-2">
                Certificate Not Found
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {error}
              </p>
            </div>
          </motion.div>
        )}

        {result && !verifyCert.isPending && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-xl"
          >
            <div className="rounded-2xl border border-primary/30 bg-primary/5 shadow-glow overflow-hidden">
              {/* Verified header */}
              <div className="bg-primary/15 border-b border-primary/30 px-8 py-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-mono text-xs text-primary uppercase tracking-widest">
                    Verified
                  </p>
                  <p className="font-display font-bold text-lg">
                    Valid Certificate
                  </p>
                </div>
                <Award className="ml-auto h-8 w-8 text-primary/40" />
              </div>

              {/* Details */}
              <div className="p-8 space-y-5">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Recipient</p>
                    <p className="font-display font-semibold text-lg">
                      {result.recipientName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Issued Date</p>
                    <p className="font-medium">
                      {formatDate(result.issuedDate)}
                    </p>
                  </div>
                </div>

                {result.fieldValues.map(([key, value]) => (
                  <div key={key} className="flex items-start gap-3">
                    <div className="h-4 w-4 mt-0.5 flex-shrink-0 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="font-medium">{value}</p>
                    </div>
                  </div>
                ))}

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Certificate ID
                    </p>
                    <p className="font-mono text-xs">{result.id}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/cert/$certId" params={{ certId: result.id }}>
                      View Certificate
                      <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom section */}
      {!result && !error && !verifyCert.isPending && (
        <motion.div
          className="mx-auto max-w-2xl text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid sm:grid-cols-3 gap-6 mt-4">
            {[
              {
                icon: QrCode,
                title: "Scan QR Code",
                desc: "Find the QR code on your certificate and scan it with your phone",
              },
              {
                icon: Search,
                title: "Enter Certificate ID",
                desc: "Type or paste the unique certificate ID shown on the document",
              },
              {
                icon: CheckCircle2,
                title: "Instant Verification",
                desc: "Get real-time verification status powered by the Internet Computer",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-3">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </main>
  );
}
