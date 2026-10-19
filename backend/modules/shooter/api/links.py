from urllib.parse import unquote, urlencode


def cheapshark_deal_url(deal_id: str) -> str:
    # CheapShark returns URL-encoded IDs; normalize once before encoding.
    query = urlencode({"dealID": unquote(deal_id)})
    return f"https://www.cheapshark.com/redirect?{query}"
