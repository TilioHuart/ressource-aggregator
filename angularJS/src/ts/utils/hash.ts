export function hashCode(str): number {
    return Array.from(str)
        .reduce((s: number, c: any) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0) as number;
}