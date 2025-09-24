export type Handler = (req: Request, res: Response, next: () => void) => void;
export interface Request {
    method: string;
    url: string;
    params: Record<string, string>;
    body?: unknown;
}
export interface Response {
    statusCode: number;
    body?: unknown;
    send: (body: unknown) => void;
}
export interface App {
    use: (fn: Handler) => App;
    get: (path: string, fn: Handler) => App;
    handle: (req: Request, res: Response) => void;
}
/** Create a tiny ESM router app (hello world baseline) */
export declare function createApp(): App;
export default createApp;
//# sourceMappingURL=index.d.ts.map