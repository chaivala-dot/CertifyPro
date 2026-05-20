export interface JwtPayload {
    sub: string;
    email: string;
}
export declare function signJwt(payload: JwtPayload): string;
export declare function verifyJwt(token: string): JwtPayload | null;
//# sourceMappingURL=jwt.d.ts.map