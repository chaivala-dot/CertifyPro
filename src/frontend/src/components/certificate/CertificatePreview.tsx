import { Award, QrCode, CheckCircle2 } from "lucide-react";
import { CertificateConfig } from "../../types/certificate";
import { FieldDefinition } from "../../backend.d";
import { cn } from "@/lib/utils";

interface CertificatePreviewProps {
    name: string;
    description: string;
    fields: FieldDefinition[];
    backgroundUrl?: string;
    logoUrl?: string;
    config: CertificateConfig;
    previewData?: Record<string, string>;
}

export function CertificatePreview({
    name,
    description,
    fields,
    backgroundUrl,
    logoUrl,
    config,
    previewData = {},
}: CertificatePreviewProps) {
    const { layout, borderStyle, accentColor, titleFont, bodyFont, showSeal, sealType, signatures } = config;

    const fontClasses = {
        serif: "font-serif",
        sans: "font-sans",
        mono: "font-mono",
        display: "font-display",
    };

    const getBorderStyle = () => {
        switch (borderStyle) {
            case "simple":
                return "border-2 border-slate-300/40";
            case "double":
                return "border-4 border-double border-slate-400/50";
            case "ornate":
                return "border-[12px] border-double border-slate-500/30 ring-2 ring-slate-400/20 ring-inset";
            default:
                return "border-none";
        }
    };

    const renderSeal = () => {
        if (!showSeal) return null;
        const colors = {
            gold: "bg-amber-100 border-amber-400 text-amber-600 shadow-[0_0_15px_rgba(251,191,36,0.3)]",
            silver: "bg-slate-100 border-slate-300 text-slate-500 shadow-[0_0_15px_rgba(148,163,184,0.2)]",
            bronze: "bg-orange-100 border-orange-300 text-orange-700 shadow-[0_0_15px_rgba(234,88,12,0.2)]",
        };
        const activeColor = colors[sealType || "gold"];

        return (
            <div className={cn("absolute bottom-10 left-10 w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center text-center p-1 z-20", activeColor)}>
                <Award className="h-8 w-8 mb-0.5" />
                <span className="text-[8px] font-bold leading-tight uppercase">Official<br />Seal</span>
            </div>
        );
    };

    return (
        <div
            className={cn(
                "relative w-full aspect-[1.414/1] rounded-xl overflow-hidden shadow-2xl transition-all duration-500",
                fontClasses[bodyFont as keyof typeof fontClasses] || "font-sans"
            )}
            style={{
                background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
                borderColor: accentColor
            }}
        >
            {/* Background Image */}
            {backgroundUrl && (
                <img
                    src={backgroundUrl}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-10"
                />
            )}

            {/* Borders */}
            <div className={cn("absolute inset-4 rounded-lg pointer-events-none z-10", getBorderStyle())} />
            {borderStyle === "ornate" && (
                <div className="absolute inset-8 border border-slate-300/40 rounded-md pointer-events-none z-10" />
            )}

            {/* Main Content Area */}
            <div className={cn(
                "relative z-20 h-full flex flex-col p-12 text-center",
                layout === "classic" ? "justify-between" : "justify-center gap-4"
            )}>

                {/* Header Section */}
                <div className="flex flex-col items-center gap-3">
                    {logoUrl && (
                        <img src={logoUrl} alt="Logo" className="h-12 object-contain mb-2" />
                    )}
                    <p className="text-[10px] tracking-[0.3em] uppercase font-medium text-slate-500">
                        Certificate of Achievement
                    </p>
                    <div className="flex items-center gap-3 w-full max-w-xs">
                        <div className="h-px flex-1 bg-slate-300" />
                        <Award className="h-5 w-5 text-slate-400" />
                        <div className="h-px flex-1 bg-slate-300" />
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col items-center gap-2">
                    <p className="text-slate-400 text-sm">This is to certify that</p>
                    <h1 className={cn(
                        "text-4xl text-slate-800 my-2",
                        fontClasses[titleFont as keyof typeof fontClasses] || "font-serif italic"
                    )}>
                        {previewData.recipientName || "Recipient Name"}
                    </h1>
                    <p className="text-slate-500">has successfully completed the requirements for</p>
                    <h2 className="text-xl font-bold text-slate-700 uppercase tracking-tight">
                        {name || "Course or Achievement Title"}
                    </h2>
                    {description && (
                        <p className="text-slate-400 text-xs max-w-md mt-2 leading-relaxed italic">
                            {description}
                        </p>
                    )}
                </div>

                {/* Footer Section (Signatures) */}
                <div className={cn(
                    "flex justify-center items-end gap-12 mt-8",
                    layout === "modern" ? "flex-row-reverse justify-between w-full" : ""
                )}>
                    {signatures.map((sig, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                            <div className="w-32 h-10 border-b border-slate-400 flex items-center justify-center font-cursive text-slate-600 italic">
                                {sig.name || "Signature"}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{sig.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Decorative Corners */}
            {borderStyle === "ornate" && (
                <>
                    <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-slate-400/40 rounded-tl-lg" />
                    <div className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-slate-400/40 rounded-tr-lg" />
                    <div className="absolute bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-slate-400/40 rounded-bl-lg" />
                    <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-slate-400/40 rounded-br-lg" />
                </>
            )}

            {/* Seal & QR */}
            {renderSeal()}
            <div className="absolute bottom-10 right-10 flex flex-col items-center gap-1.5 opacity-80">
                <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                    <QrCode className="h-10 w-10 text-slate-800" />
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-full">
                    <CheckCircle2 className="h-2 w-2 text-green-600" />
                    <span className="text-[6px] font-mono text-green-700 font-bold">VERIFIED</span>
                </div>
            </div>
        </div>
    );
}
