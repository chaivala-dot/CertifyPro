export type LayoutType = "centered" | "modern" | "classic";
export type BorderStyle = "none" | "simple" | "double" | "ornate";
export type SealType = "gold" | "silver" | "bronze";

export interface SignatureConfig {
    title: string;
    name: string;
    image?: string; // base64
}

export interface CertificateConfig {
    layout: LayoutType;
    borderStyle: BorderStyle;
    accentColor: string;
    titleFont: string;
    bodyFont: string;
    showSeal: boolean;
    sealType?: SealType;
    signatures: SignatureConfig[];
}

export const DEFAULT_CONFIG: CertificateConfig = {
    layout: "centered",
    borderStyle: "simple",
    accentColor: "#334155", // slate-700
    titleFont: "serif",
    bodyFont: "sans",
    showSeal: false,
    signatures: [{ title: "Authorized Signatory", name: "" }],
};
