export interface IFileEventHandler {
    handle(input: IFileEventHandle.Input): Promise<void>;
}

export namespace IFileEventHandle {
    export type Input = {
        fileKey: string;
    };
}
