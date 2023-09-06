/**
 * Find target element in DOM starting from either a CSS selector or an element instance.
 * @param selector Target image specified as string (CSS selector) or HTMLImageElement.
 */
export function getImage(selector: string | HTMLImageElement): HTMLImageElement {
    let image: HTMLImageElement | null = null;

    if (typeof selector === "string") {
        image = document.querySelector(selector);
    } else {
        image = selector;
    }

    if (!(image instanceof HTMLImageElement)) {
        throw new Error("Crop target must be an image element or a CSS selector pointing to one.");
    }

    return image;
}

export function px(x: number) {
    return x.toString() + "px";
}
