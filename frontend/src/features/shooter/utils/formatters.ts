export function formatPrice(price: string, currency: string): string {
    return new Intl.NumberFormat("es-NI", {
        style: "currency",
        currency,
        currencyDisplay: "code",
    }).format(Number(price));
}