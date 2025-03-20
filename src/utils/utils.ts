export function normalizeSite(site: string): string {
    if (!site) {
        return '';
    }
    return site.trim().toLowerCase();
}