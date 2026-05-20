export const idlFactory = ({ IDL }) => {
    const FieldDefinition = IDL.Record({
        fieldName: IDL.Text,
        fieldType: IDL.Text,
        required: IDL.Bool,
    });

    const ExternalBlob = IDL.Vec(IDL.Nat8);

    const Recipient = IDL.Record({
        name: IDL.Text,
        email: IDL.Text,
        fieldValues: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    });

    const CertificateBatch = IDL.Record({
        id: IDL.Text,
        name: IDL.Text,
        templateId: IDL.Text,
        status: IDL.Text,
        created: IDL.Nat64,
        owner: IDL.Principal,
        recipients: IDL.Vec(Recipient),
    });

    const CertificateTemplate = IDL.Record({
        id: IDL.Text,
        name: IDL.Text,
        description: IDL.Text,
        fields: IDL.Vec(FieldDefinition),
        backgroundImage: ExternalBlob,
        logoImage: ExternalBlob,
        owner: IDL.Principal,
    });

    const UserProfile = IDL.Record({
        name: IDL.Text,
    });

    const UserRole = IDL.Variant({
        admin: IDL.Null,
        user: IDL.Null,
        guest: IDL.Null,
    });

    const Certificate = IDL.Record({
        id: IDL.Text,
        verificationCode: IDL.Vec(IDL.Nat8),
        fieldValues: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
        issuedDate: IDL.Nat64,
        downloadCount: IDL.Nat64,
        batchId: IDL.Text,
        recipientName: IDL.Text,
        publicShare: IDL.Bool,
        recipientEmail: IDL.Text,
    });

    const CertificateStats = IDL.Record({
        batchesCount: IDL.Nat64,
        templatesCount: IDL.Nat64,
        certificatesIssued: IDL.Nat64,
    });

    const _CaffeineStorageRefillInformation = IDL.Record({
        proposed_top_up_amount: IDL.Opt(IDL.Nat64),
    });

    const _CaffeineStorageRefillResult = IDL.Record({
        success: IDL.Opt(IDL.Bool),
        topped_up_amount: IDL.Opt(IDL.Nat64),
    });

    const _CaffeineStorageCreateCertificateResult = IDL.Record({
        method: IDL.Text,
        blob_hash: IDL.Text,
    });

    return IDL.Service({
        _caffeineStorageBlobIsLive: IDL.Func([IDL.Vec(IDL.Nat8)], [IDL.Bool], ['query']),
        _caffeineStorageBlobsToDelete: IDL.Func([], [IDL.Vec(IDL.Vec(IDL.Nat8))], ['query']),
        _caffeineStorageConfirmBlobDeletion: IDL.Func([IDL.Vec(IDL.Vec(IDL.Nat8))], [], []),
        _caffeineStorageCreateCertificate: IDL.Func([IDL.Text], [_CaffeineStorageCreateCertificateResult], []),
        _caffeineStorageRefillCashier: IDL.Func([IDL.Opt(_CaffeineStorageRefillInformation)], [_CaffeineStorageRefillResult], []),
        _caffeineStorageUpdateGatewayPrincipals: IDL.Func([], [], []),
        _initializeAccessControlWithSecret: IDL.Func([IDL.Text], [], []),
        assignCallerUserRole: IDL.Func([IDL.Principal, UserRole], [], []),
        createBatch: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Vec(Recipient)], [], []),
        createTemplate: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Vec(FieldDefinition), ExternalBlob, ExternalBlob], [], []),
        deleteBatch: IDL.Func([IDL.Text], [], []),
        deleteTemplate: IDL.Func([IDL.Text], [], []),
        getBatch: IDL.Func([IDL.Text], [CertificateBatch], ['query']),
        getCallerUserProfile: IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
        getCallerUserRole: IDL.Func([], [UserRole], ['query']),
        getCertificate: IDL.Func([IDL.Text], [Certificate], ['query']),
        getTemplate: IDL.Func([IDL.Text], [CertificateTemplate], ['query']),
        getUserProfile: IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
        getUserStats: IDL.Func([], [CertificateStats], ['query']),
        incrementDownloadCount: IDL.Func([IDL.Text], [], []),
        isCallerAdmin: IDL.Func([], [IDL.Bool], ['query']),
        listBatches: IDL.Func([], [IDL.Vec(CertificateBatch)], ['query']),
        saveCallerUserProfile: IDL.Func([UserProfile], [], []),
        updateTemplate: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Vec(FieldDefinition), ExternalBlob, ExternalBlob], [], []),
        verifyCertificate: IDL.Func([IDL.Vec(IDL.Nat8)], [Certificate], ['query']),
    });
};

export const init = ({ IDL }) => {
    return [IDL.Text];
};
