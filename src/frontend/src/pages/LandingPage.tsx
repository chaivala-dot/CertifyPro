import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BarChart3,
  Check,
  ChevronRight,
  FileSpreadsheet,
  QrCode,
  Share2,
  Shield,
  Zap,
} from "lucide-react";
import { type Easing, type Variants, motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const EASE_OUT: Easing = "easeOut";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: EASE_OUT },
  }),
};

const STATS = [
  { value: "10,000+", label: "Certificates Generated" },
  { value: "500+", label: "Organizations" },
  { value: "99.9%", label: "Uptime" },
  { value: "<2s", label: "Generation Time" },
];

const FEATURES = [
  {
    icon: Award,
    title: "Drag & Drop Template Builder",
    desc: "Canvas-based editor. Add text fields, images, logos, and signatures. Save as reusable templates.",
    color: "emerald",
  },
  {
    icon: FileSpreadsheet,
    title: "Bulk CSV Generation",
    desc: "Upload a spreadsheet with 1,000s of recipients and generate print-ready certificates in seconds.",
    color: "purple",
  },
  {
    icon: QrCode,
    title: "QR Verification System",
    desc: "Every certificate gets a unique QR code. Scan to instantly verify authenticity — like Coursera.",
    color: "amber",
  },
  {
    icon: BarChart3,
    title: "Admin Analytics",
    desc: "Track generation history, download rates, and verify certificate status from a central dashboard.",
    color: "emerald",
  },
  {
    icon: Share2,
    title: "LinkedIn Sharing",
    desc: "Recipients get a public shareable URL with Open Graph tags optimized for LinkedIn previews.",
    color: "purple",
  },
  {
    icon: Shield,
    title: "Forgery Prevention",
    desc: "Blockchain-backed verification on the Internet Computer. Certificates can't be faked or altered.",
    color: "amber",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Design Your Template",
    desc: "Use our visual builder to create a stunning certificate template with your branding, fields, and layout.",
  },
  {
    number: "02",
    title: "Upload Recipient CSV",
    desc: "Upload a spreadsheet with recipient names, emails, and any custom fields like scores or course titles.",
  },
  {
    number: "03",
    title: "Download & Distribute",
    desc: "Instantly generate all certificates. Share via email, public links, or download as a ZIP package.",
  },
];

const COLOR_MAP = {
  emerald: {
    icon: "text-primary",
    bg: "bg-primary/10 border-primary/20",
    glow: "hover:shadow-glow",
  },
  purple: {
    icon: "text-cp-purple",
    bg: "bg-cp-purple/10 border-cp-purple/20",
    glow: "hover:shadow-glow-purple",
  },
  amber: {
    icon: "text-cp-amber",
    bg: "bg-cp-amber/10 border-cp-amber/20",
    glow: "",
  },
};

export function LandingPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <main className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative py-24 md:py-36 px-4">
        {/* Ambient glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.82 0.12 162 / 0.25) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-mono text-primary mb-8">
              <Zap className="h-3 w-3" />
              <span>Blockchain-Verified Certificates on Internet Computer</span>
            </div>
          </motion.div>

          <motion.h1
            className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Generate Certificates <span className="text-primary">at Scale</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Design beautiful certificate templates, bulk-generate from CSV data,
            and distribute with tamper-proof QR verification. Built for
            organizations that care about credibility.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {isAuthenticated ? (
              <Button
                asChild
                size="lg"
                className="text-base px-8 h-12 shadow-glow"
              >
                <Link to="/dashboard">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                className="text-base px-8 h-12 shadow-glow"
                onClick={login}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Signing in…" : "Get Started Free"}{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-base px-8 h-12"
            >
              <Link to="/verify" search={{ code: "" }}>
                Verify a Certificate <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Hero visual — certificate preview */}
        <motion.div
          className="relative mx-auto max-w-3xl mt-16 px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <div className="rounded-2xl border border-border bg-card p-1 shadow-glow overflow-hidden">
            <div className="rounded-xl overflow-hidden bg-surface-1">
              {/* Mock certificate */}
              <div className="relative aspect-[1.414/1] bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-8 text-center">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #f8f9fc 0%, #f0f3fa 50%, #e8edf5 100%)",
                  }}
                />
                <div className="absolute inset-4 border-2 border-slate-300/60 rounded-lg pointer-events-none" />
                <div className="absolute inset-6 border border-slate-200/40 rounded-md pointer-events-none" />

                <div className="relative z-10 space-y-2">
                  <p className="text-slate-500 text-xs tracking-[0.2em] uppercase font-mono">
                    Certificate of Achievement
                  </p>
                  <p className="text-slate-400 text-sm">This certifies that</p>
                  <p className="font-serif text-3xl sm:text-4xl text-slate-800 italic">
                    Alexandra Chen
                  </p>
                  <p className="text-slate-500 text-sm max-w-sm">
                    has successfully completed the course
                  </p>
                  <p className="font-display text-lg sm:text-xl font-bold text-slate-700">
                    Advanced Machine Learning with Python
                  </p>
                  <div className="flex items-center justify-center gap-6 pt-3 text-slate-400 text-xs">
                    <span>Issued: March 2, 2026</span>
                    <span>•</span>
                    <span>Score: 96%</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 pt-1">
                    <div className="h-px w-12 bg-slate-300" />
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center">
                      <Award className="h-3 w-3 text-slate-400" />
                    </div>
                    <div className="h-px w-12 bg-slate-300" />
                  </div>
                  <p className="text-slate-400 text-xs">
                    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/30 rounded px-2 py-0.5 font-mono text-[10px]">
                      <QrCode className="h-2.5 w-2.5" />
                      CERT-2026-AXCH-9F4B
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute -left-4 top-8 hidden sm:block">
            <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-card text-xs font-mono text-primary flex items-center gap-2">
              <Check className="h-3.5 w-3.5" />
              Verified
            </div>
          </div>
          <div className="absolute -right-4 bottom-16 hidden sm:block">
            <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-card text-xs font-mono text-cp-amber flex items-center gap-2">
              <Zap className="h-3.5 w-3.5" />
              1,247 certs generated
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-surface-1/50">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
              >
                <div className="font-display text-3xl font-extrabold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-mono tracking-widest text-primary uppercase mb-3">
              Features
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Everything you need for professional certificates
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => {
              const colors = COLOR_MAP[feature.color as keyof typeof COLOR_MAP];
              return (
                <motion.div
                  key={feature.title}
                  className={`relative rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 ${colors.glow}`}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                >
                  <div
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${colors.bg} mb-4`}
                  >
                    <feature.icon className={`h-5 w-5 ${colors.icon}`} />
                  </div>
                  <h3 className="font-display font-semibold text-base mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 border-t border-border bg-surface-1/30">
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-mono tracking-widest text-primary uppercase mb-3">
              How It Works
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Three steps to your first certificate
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                className="relative"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
              >
                {i < STEPS.length - 1 && (
                  <div className="absolute top-6 left-[calc(100%-0px)] w-full h-px bg-border hidden md:block" />
                )}
                <div className="flex flex-col gap-4">
                  <div className="font-mono text-4xl font-bold text-primary/30">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-3xl">
          <motion.div
            className="relative rounded-2xl border border-primary/30 bg-primary/5 p-12 text-center overflow-hidden shadow-glow"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, oklch(0.82 0.12 162 / 0.08) 0%, transparent 60%)",
              }}
            />
            <div className="relative z-10">
              <Award className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Start issuing certificates today
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Join hundreds of organizations using CertifyPro for professional
                certificate management.
              </p>
              {isAuthenticated ? (
                <Button asChild size="lg" className="shadow-glow">
                  <Link to="/dashboard">
                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="shadow-glow"
                  onClick={login}
                  disabled={isLoggingIn}
                >
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
