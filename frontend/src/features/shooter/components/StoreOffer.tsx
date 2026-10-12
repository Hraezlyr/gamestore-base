import { useId, useState } from "react";
import {
  autoUpdate, flip, FloatingFocusManager, FloatingPortal, offset, safePolygon,
  shift, useClick, useDismiss, useFloating, useFocus, useHover, useInteractions, useRole,
} from "@floating-ui/react";
import { ArrowUpRight, X } from "lucide-react";
import type { GameOffer } from "../types/catalog";
import { formatPrice } from "../utils/formatters";
import { StoreIcon } from "./StoreIcon";

export function StoreOffer({ offer, isBestPrice }: { offer: GameOffer; isBestPrice: boolean }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const { refs: { setReference, setFloating }, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "top",
    strategy: "fixed",
    middleware: [offset(10), flip(), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  });
  const hover = useHover(context, { mouseOnly: true, delay: { open: 100, close: 100 }, handleClose: safePolygon() });
  const focus = useFocus(context);
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "dialog" });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, click, dismiss, role]);
  const discounted = Number(offer.price) < Number(offer.retail_price);

  return <>
    <button
      ref={setReference}
      className="shooter-store-trigger"
      type="button"
      data-best-price={isBestPrice || undefined}
      {...getReferenceProps({ "aria-label": `Ver oferta de ${offer.store_name}` })}
    >
      <StoreIcon src={offer.store_icon_url} />
    </button>
    {open && <FloatingPortal>
      <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
        <div ref={setFloating} style={floatingStyles} className="shooter-offer-popover" {...getFloatingProps({ "aria-labelledby": titleId })}>
          <div className="shooter-offer-popover__heading">
            <h3 id={titleId}>{offer.store_name}</h3>
            <button type="button" className="shooter-offer-popover__close" aria-label="Cerrar oferta" onClick={() => setOpen(false)}><X size={16} aria-hidden="true" /></button>
          </div>
          {isBestPrice && <span className="shooter-best-price">Mejor precio</span>}
          <p className="shooter-offer-popover__price">{formatPrice(offer.price, offer.currency)}</p>
          {discounted && <p className="shooter-offer-popover__regular">Precio regular <s>{formatPrice(offer.retail_price, offer.currency)}</s></p>}
          <a className="shooter-offer-popover__purchase" href={offer.purchase_url} target="_blank" rel="noopener noreferrer" aria-label={`Ver oferta en ${offer.store_name}`}>
            Ir a la tienda <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      </FloatingFocusManager>
    </FloatingPortal>}
  </>;
}
