import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface FieldDefinition {
    required: boolean;
    fieldName: string;
    fieldType: string;
}
export interface CertificateStats {
    batchesCount: bigint;
    templatesCount: bigint;
    certificatesIssued: bigint;
}
export interface CertificateBatch {
    id: string;
    status: string;
    created: bigint;
    owner: Principal;
    templateId: string;
    name: string;
    recipients: Array<Recipient>;
}
export interface CertificateTemplate {
    id: string;
    logoImage: ExternalBlob;
    owner: Principal;
    name: string;
    description: string;
    backgroundImage: ExternalBlob;
    fields: Array<FieldDefinition>;
}
export interface Recipient {
    name: string;
    fieldValues: Array<[string, string]>;
    email: string;
}
export interface Certificate {
    id: string;
    verificationCode: Uint8Array;
    fieldValues: Array<[string, string]>;
    issuedDate: bigint;
    downloadCount: bigint;
    batchId: string;
    recipientName: string;
    publicShare: boolean;
    recipientEmail: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBatch(batchId: string, name: string, templateId: string, recipients: Array<Recipient>): Promise<void>;
    createTemplate(id: string, name: string, description: string, fields: Array<FieldDefinition>, backgroundImage: ExternalBlob, logoImage: ExternalBlob): Promise<void>;
    deleteBatch(batchId: string): Promise<void>;
    deleteTemplate(id: string): Promise<void>;
    getBatch(batchId: string): Promise<CertificateBatch>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCertificate(certificateId: string): Promise<Certificate>;
    getTemplate(id: string): Promise<CertificateTemplate>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserStats(): Promise<CertificateStats>;
    incrementDownloadCount(certificateId: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    listBatches(): Promise<Array<CertificateBatch>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateTemplate(id: string, name: string, description: string, fields: Array<FieldDefinition>, backgroundImage: ExternalBlob, logoImage: ExternalBlob): Promise<void>;
    verifyCertificate(verificationCode: Uint8Array): Promise<Certificate>;
}
