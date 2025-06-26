declare module 'iso8583-js' {
    class ISO8583 {
        constructor(opts?: { header?: string; elementName?: boolean; mti?: boolean });
        init(params: any): void;
        set(name: string | number, value: string, opts?: { length?: number }): any;
        get(name: string, value?: any): any;
        wrapMsg(mti?: string, opts?: any): string;
        unWrapMsg(hex: string, opts?: { output?: string; validate?: boolean }): any;
    }
    
    export = ISO8583;
} 