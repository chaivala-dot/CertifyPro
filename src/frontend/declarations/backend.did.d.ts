import type { Principal } from "@icp-sdk/core/principal";

export interface FieldDefinition {
    fieldName: string;
    fieldType: string;
    required: boolean;
}

export interface ExternalBlob {
    bytes: Uint8Array;
}

export interface CertificateTemplate {
    id: string;
    name: string;
    description: string;
    fields: Array<FieldDefinition>;
    backgroundImage: ExternalBlob;
    logoImage: ExternalBlob;
    owner: Principal;
}

export interface UserProfile {
    name: string;
}

export type UserRole = { admin: null } | { user: null } | { guest: null };

export interface _CaffeineStorageRefillInformation {
    proposed_top_up_amount?: bigint;
}

export interface _CaffeineStorageRefillResult {
    success?: boolean;
    topped_up_amount?: bigint;
}

export interface _SERVICE {
    _caffeineStorageBlobIsLive(hash: Uint8Array): Promise<boolean>;
    _caffeineStorageBlobsToDelete(): Promise<Array<Uint8Array>>;
    _caffeineStorageConfirmBlobDeletion(blobs: Array<Uint8Array>): Promise<void>;
    _caffeineStorageCreateCertificate(blobHash: string): Promise<{ method: string; blob_hash: string }>;
    _caffeineStorageRefillCashier(refillInformation: [] | [_CaffeineStorageRefillInformation]): Promise<_CaffeineStorageRefillResult>;
    _caffeineStorageUpdateGatewayPrincipals(): Promise<void>;
    _initializeAccessControlWithSecret(userSecret: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBatch(batchId: string, name: string, templateId: string, recipients: Array<{
        name: string;
        email: string;
        fieldValues: Array<[string, string]>;
    }>): Promise<void>;
    createTemplate(id: string, name: string, description: string, fields: Array<FieldDefinition>, backgroundImage: ExternalBlob, logoImage: ExternalBlob): Promise<void>;
    deleteBatch(batchId: string): Promise<void>;
    deleteTemplate(id: string): Promise<void>;
    getBatch(batchId: string): Promise<{
        id: string;
        name: string;
        templateId: string;
        status: string;
        created: bigint;
        owner: Principal;
        recipients: Array<{
            name: string;
            email: string;
            fieldValues: Array<[string, string]>;
        }>;
    }>;
    getCallerUserProfile(): Promise<[] | [UserProfile]>;
    getCallerUserRole(): Promise<UserRole>;
    getCertificate(certificateId: string): Promise<{
        id: string;
        verificationCode: Uint8Array;
        fieldValues: Array<[string, string]>;
        issuedDate: bigint;
        downloadCount: bigint;
        batchId: string;
        recipientName: string;
        publicShare: boolean;
        recipientEmail: string;
    }>;
    getTemplate(id: string): Promise<CertificateTemplate>;
    getUserProfile(user: Principal): Promise<[] | [UserProfile]>;
    getUserStats(): Promise<{
        batchesCount: bigint;
        templatesCount: bigint;
        certificatesIssued: bigint;
    }>;
    incrementDownloadCount(certificateId: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    listBatches(): Promise<Array<{
        id: string;
        name: string;
        templateId: string;
        status: string;
        created: bigint;
        owner: Principal;
        recipients: Array<{
            name: string;
            email: string;
            fieldValues: Array<[string, string]>;
        }>;
    }>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateTemplate(id: string, name: string, description: string, fields: Array<FieldDefinition>, backgroundImage: ExternalBlob, logoImage: ExternalBlob): Promise<void>;
    verifyCertificate(verificationCode: Uint8Array): Promise<{
        id: string;
        verificationCode: Uint8Array;
        fieldValues: Array<[string, string]>;
        issuedDate: bigint;
        downloadCount: bigint;
        batchId: string;
        recipientName: string;
        publicShare: boolean;
        recipientEmail: string;
    }>;
}

export declare const idlFactory: (IDL: any) => any;
