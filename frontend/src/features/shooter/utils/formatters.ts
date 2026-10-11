export function formatPrice(price: string, currency: string): string {
    if (Number(price) === 0) return "Gratis";
    return new Intl.NumberFormat("es-NI", {
        style: "currency",
        currency,
        currencyDisplay: "code",
    }).format(Number(price));
}
