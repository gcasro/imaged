import CropStyles from "./Crop.css";

import { getImage, px } from "./helpers";

const instanceKey = "__imagedCropInstance";

/**
 * Crop options.
 */
export type CropOptions = {
    /**
     * Draw a rounded viewport instead of rectangular.
     */
    roundFrame: boolean;

    /**
     * Enforce an aspect ratio (width / height) on the viewport.
     */
    aspectRatio: number;

    /**
     * Use this color as background for cropping transparent images.
     * By default black (#ffffff) is used.
     */
    backgroundColor: string;

    /**
     * Event listener called every time the selection is updated (and at start).
     * Takes no arguments; use the `to*()` methods to obtain the actual image.
     * The `this` object will be the very instance of Crop which this is given to.
     */
    onCrop: (this: Crop) => void;

    /**
     * Minimum or maximum output image size in pixels.
     */
    minOutputWidth: number;
    minOutputHeight: number;
    maxOutputWidth: number;
    maxOutputHeight: number;

    /**
     * Container element where the Crop panel should be appended (at the end).
     * Normally, the parent of the target image is used but you can control that.
     *
     * Container MUST be the exact same size as the image and must have `position`
     * style set to one of `relative | absolute | fixed`.
     */
    container: string | HTMLElement;

    /**
     * Append CSS styles over the internal ones (inside Shadow DOM).
     */
    additionalStyles: string;
};

enum EAspectRule {
    SCALE_WIDTH,
    SCALE_HEIGHT,
    SCALE_BOTH,
}

type CropSelection = { x1: number; y1: number; x2: number; y2: number };
type KnobCofficients = {
    rule: EAspectRule;

    // Multipliers for applying translation deltas on the selection.
    dx1: number;
    dy1: number;
    dx2: number;
    dy2: number;

    // Multipliers for applying aspect ratio corrections on the selection.
    ax1: number;
    ay1: number;
    ax2: number;
    ay2: number;
};

/**
 * The main Crop interface.
 *
 * The main usage principle is to place the image you need cropped into the DOM,
 * wherever you like, and then instantiate the Crop on that image. The Crop
 * will overlay all its resources over the existing image.
 */
export default class Crop {
    // Original image.
    protected image: HTMLImageElement;

    // Toolset.
    protected panel: HTMLDivElement;
    protected frame: HTMLDivElement;
    protected light: SVGRectElement;
    protected shade: SVGRectElement;

    // UI change observers.
    protected listeners: { [event: string]: (event: any) => void } = {};

    // Selection.
    protected canvas: HTMLCanvasElement;
    protected selection: CropSelection = { x1: 0, y1: 0, x2: 0, y2: 0 };
    protected oldSelection: CropSelection = { x1: 0, y1: 0, x2: 0, y2: 0 };
    protected minApparentWidth: number = 0;
    protected minApparentHeight: number = 0;
    protected maxApparentWidth: number = 0;
    protected maxApparentHeight: number = 0;

    // Knob coefficient matrix (determines how each knob modifies the selection when dragged).
    protected coefficients: { [key: string]: KnobCofficients } = {
        n: { dx1: 0, dy1: 1, dx2: 0, dy2: 0, ax1: 0.5, ay1: 1, ax2: 0.5, ay2: 0, rule: EAspectRule.SCALE_HEIGHT },
        e: { dx1: 0, dy1: 0, dx2: 1, dy2: 0, ax1: 0, ay1: 0.5, ax2: 1, ay2: 0.5, rule: EAspectRule.SCALE_WIDTH },
        s: { dx1: 0, dy1: 0, dx2: 0, dy2: 1, ax1: 0.5, ay1: 0, ax2: 0.5, ay2: 1, rule: EAspectRule.SCALE_HEIGHT },
        w: { dx1: 1, dy1: 0, dx2: 0, dy2: 0, ax1: 1, ay1: 0.5, ax2: 0, ay2: 0.5, rule: EAspectRule.SCALE_WIDTH },

        ne: { dx1: 0, dy1: 1, dx2: 1, dy2: 0, ax1: 0, ay1: 1, ax2: 1, ay2: 0, rule: EAspectRule.SCALE_BOTH },
        se: { dx1: 0, dy1: 0, dx2: 1, dy2: 1, ax1: 0, ay1: 0, ax2: 1, ay2: 1, rule: EAspectRule.SCALE_BOTH },
        sw: { dx1: 1, dy1: 0, dx2: 0, dy2: 1, ax1: 1, ay1: 0, ax2: 0, ay2: 1, rule: EAspectRule.SCALE_BOTH },
        nw: { dx1: 1, dy1: 1, dx2: 0, dy2: 0, ax1: 1, ay1: 1, ax2: 0, ay2: 0, rule: EAspectRule.SCALE_BOTH },

        frame: { dx1: 1, dy1: 1, dx2: 1, dy2: 1, ax1: 0, ay1: 0, ax2: 0, ay2: 0, rule: EAspectRule.SCALE_BOTH },
    };

    // Dragging handlers.
    protected activeKnob: string | undefined = undefined;
    protected xOffset: number = 0;
    protected yOffset: number = 0;

    protected initializeDragEvents() {
        this.listeners.dragStart = (event: MouseEvent | TouchEvent) => {
            if (window.TouchEvent && event instanceof TouchEvent) {
                this.xOffset = event.touches[0].clientX;
                this.yOffset = event.touches[0].clientY;
            } else {
                this.xOffset = (<MouseEvent>event).clientX;
                this.yOffset = (<MouseEvent>event).clientY;
            }
            const node = event.target as HTMLElement;
            const knob = this.coefficients[node.id];
            if (knob) {
                this.oldSelection = this.selection;
                this.activeKnob = node.id;
            }
            node.classList.add("active");
        };

        this.listeners.dragEnd = (_event: MouseEvent | TouchEvent) => {
            if (this.activeKnob) {
                this.panel.shadowRoot?.getElementById(this.activeKnob)?.classList.remove("active");
                this.activeKnob = undefined;
            }
        };

        this.listeners.drag = (event: MouseEvent | TouchEvent) => {
            if (this.activeKnob) {
                let xDelta: number;
                let yDelta: number;
                if (window.TouchEvent && event instanceof TouchEvent) {
                    xDelta = event.touches[0].clientX - this.xOffset;
                    yDelta = event.touches[0].clientY - this.yOffset;
                } else {
                    xDelta = (<MouseEvent>event).clientX - this.xOffset;
                    yDelta = (<MouseEvent>event).clientY - this.yOffset;
                }
                this.updateSelection(xDelta, yDelta);
            }
        };

        document.addEventListener("touchend", this.listeners.dragEnd, false);
        document.addEventListener("touchmove", this.listeners.drag, false);
        document.addEventListener("mouseup", this.listeners.dragEnd, false);
        document.addEventListener("mousemove", this.listeners.drag, false);
        const initializeKnob = (knob?: HTMLDivElement | null) => {
            knob?.addEventListener("touchstart", this.listeners.dragStart, false);
            knob?.addEventListener("mousedown", this.listeners.dragStart, false);
        };
        Object.keys(this.coefficients).forEach((key) => initializeKnob(this.frame.querySelector<HTMLDivElement>("#" + key)));
        initializeKnob(this.frame);
    }

    protected initializeSelection() {
        // Initial placement.
        const bounds = this.image.getBoundingClientRect();
        const sourceRatio = bounds.width / bounds.height;
        const targetRatio = this.options?.aspectRatio || sourceRatio;
        let width: number = bounds.width;
        let height: number = bounds.height;
        if (targetRatio > sourceRatio) {
            height = width / targetRatio;
        } else {
            width = height * targetRatio;
        }
        this.selection = {
            x1: bounds.width / 2 - width / 2,
            y1: bounds.height / 2 - height / 2,
            x2: bounds.width / 2 + width / 2,
            y2: bounds.height / 2 + height / 2,
        };
        this.oldSelection = this.selection;

        // Establish bounds.
        this.minApparentWidth = 32;
        if (this.options?.minOutputWidth) {
            this.minApparentWidth = Math.min(
                bounds.width,
                Math.max(this.minApparentWidth, this.options.minOutputWidth * (bounds.width / this.image.naturalWidth))
            );
        }
        this.minApparentHeight = 32;
        if (this.options?.minOutputHeight) {
            this.minApparentHeight = Math.min(
                bounds.height,
                Math.max(this.minApparentHeight, this.options.minOutputHeight * (bounds.height / this.image.naturalHeight))
            );
        }
        this.maxApparentWidth = bounds.width;
        if (this.options?.maxOutputWidth) {
            this.maxApparentWidth = Math.min(this.maxApparentWidth, this.options.maxOutputWidth * (bounds.width / this.image.naturalWidth));
        }
        this.maxApparentHeight = bounds.height;
        if (this.options?.maxOutputHeight) {
            this.maxApparentHeight = Math.min(this.maxApparentHeight, this.options.maxOutputHeight * (bounds.height / this.image.naturalHeight));
        }

        // Calibrate selection at start.
        this.updateSelection(0, 0);
    }

    protected enforceAspectRatio(selection: CropSelection, coefficients: KnobCofficients, rule: EAspectRule) {
        const ratio = this.options?.aspectRatio;
        if (ratio) {
            const width = selection.x2 - selection.x1;
            const height = selection.y2 - selection.y1;

            let newWidth: number = width;
            let newHeight: number = height;

            switch (rule) {
                case EAspectRule.SCALE_WIDTH:
                    newHeight = width / ratio;
                    break;
                case EAspectRule.SCALE_HEIGHT:
                    newWidth = height * ratio;
                    break;
                case EAspectRule.SCALE_BOTH:
                    if (width / ratio > height) {
                        newWidth = height * ratio;
                    } else {
                        newHeight = width / ratio;
                    }
                    break;
            }

            selection.x1 -= coefficients.ax1 * (newWidth - width);
            selection.y1 -= coefficients.ay1 * (newHeight - height);
            selection.x2 += coefficients.ax2 * (newWidth - width);
            selection.y2 += coefficients.ay2 * (newHeight - height);
        }
    }

    protected updateSelection(xDelta: number, yDelta: number) {
        const bounds = this.image.getBoundingClientRect();
        const coefficients = this.coefficients[this.activeKnob || "frame"];

        // Apply translation deltas.
        const newSelection = {
            x1: this.oldSelection.x1 + coefficients.dx1 * xDelta,
            y1: this.oldSelection.y1 + coefficients.dy1 * yDelta,
            x2: this.oldSelection.x2 + coefficients.dx2 * xDelta,
            y2: this.oldSelection.y2 + coefficients.dy2 * yDelta,
        };

        // Adjust selection according to aspect ratio rules.
        this.enforceAspectRatio(newSelection, coefficients, coefficients.rule);

        // Enforce edge constraints (clip/move selection).
        if (newSelection.x1 < 0) {
            newSelection.x2 -= newSelection.x1 * coefficients.dx2;
            newSelection.x2 += newSelection.x1 * coefficients.ax2 * 2;
            newSelection.x1 = 0;
        }
        if (newSelection.y1 < 0) {
            newSelection.y2 -= newSelection.y1 * coefficients.dy2;
            newSelection.y2 += newSelection.y1 * coefficients.ay2 * 2;
            newSelection.y1 = 0;
        }
        if (newSelection.x2 > bounds.width) {
            const delta = newSelection.x2 - bounds.width;
            newSelection.x1 -= delta * coefficients.dx1;
            newSelection.x1 += delta * coefficients.ax1 * 2;
            newSelection.x2 = bounds.width;
        }
        if (newSelection.y2 > bounds.height) {
            const delta = newSelection.y2 - bounds.height;
            newSelection.y1 -= delta * coefficients.dy1;
            newSelection.y1 += delta * coefficients.ay1 * 2;
            newSelection.y2 = bounds.height;
        }

        // Enforce size constraints.
        const width = newSelection.x2 - newSelection.x1;
        const height = newSelection.y2 - newSelection.y1;
        if (width < this.minApparentWidth) {
            const delta = this.minApparentWidth - width;
            newSelection.x1 -= delta * coefficients.ax1;
            newSelection.x2 += delta * coefficients.ax2;
        }
        if (width > this.maxApparentWidth) {
            newSelection.x1 = this.selection.x1;
            newSelection.x2 = this.selection.x1 + this.maxApparentWidth;
        }
        if (height < this.minApparentHeight) {
            const delta = this.minApparentHeight - height;
            newSelection.y1 -= delta * coefficients.ay1;
            newSelection.y2 += delta * coefficients.ay2;
        }
        if (height > this.maxApparentHeight) {
            newSelection.y1 = this.selection.y1;
            newSelection.y2 = this.selection.y1 + this.maxApparentHeight;
        }

        // After clipping, ensure that entire selection is contained to aspect ratio.
        this.enforceAspectRatio(newSelection, coefficients, EAspectRule.SCALE_BOTH);

        // Apply selection.
        this.selection = newSelection;
        this.refreshSelection();
    }

    protected refreshSelection() {
        this.light.setAttribute("x", px(this.selection.x1));
        this.light.setAttribute("y", px(this.selection.y1));
        this.light.setAttribute("width", px(this.selection.x2 - this.selection.x1));
        this.light.setAttribute("height", px(this.selection.y2 - this.selection.y1));

        this.frame.style.left = px(this.selection.x1);
        this.frame.style.top = px(this.selection.y1);
        this.frame.style.width = px(this.selection.x2 - this.selection.x1);
        this.frame.style.height = px(this.selection.y2 - this.selection.y1);

        this.options?.onCrop?.call(this);
    }

    /**
     * Instantiate the Crop over an existing image.
     *
     * @param target The target image to crop (CSS selector string or HTMLImageElement).
     */
    constructor(target: string | HTMLImageElement, readonly options?: Partial<CropOptions>) {
        this.image = getImage(target);

        // Make sure only one crop is instantiated per image.
        if (this.image.dataset[instanceKey]) {
            throw new Error("ImagedCrop: Target image already has a Crop instance attached!");
        }
        this.image.dataset[instanceKey] = "true";

        // Build tools (inlined styles ensure priorty over CSS stylesheets).
        this.panel = document.createElement("div");
        this.panel.style.position = "absolute";
        this.panel.style.border = "none";
        this.panel.style.background = "none";
        this.panel.style.left = px(0);
        this.panel.style.top = px(0);
        this.panel.style.right = px(0);
        this.panel.style.bottom = px(0);
        const panelShadowRoot = this.panel.attachShadow({ mode: "open" });
        panelShadowRoot.innerHTML = `
            <style>
                ${CropStyles}
                ${options?.additionalStyles || ""}
            </style>
            <svg id="overlay" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                <mask id="mask">
                    <rect id="shade" fill="#fff" />
                    <rect id="light" fill="#000" ${this.options?.roundFrame ? 'rx="50%" ry="50%"' : ""} />
                </mask>
                <rect x="0%" y="0%" width="100%" height="100%" fill="currentFill" mask="url(#mask)" />
            </svg>
        `;
        this.frame = document.createElement("div");
        this.frame.setAttribute("id", "frame");
        this.frame.style.position = "absolute";
        this.frame.style.borderRadius = this.options?.roundFrame ? "50%" : "0";
        this.frame.innerHTML = `
            <div id="n" class="knob" style="position: absolute;"></div>
            <div id="ne" class="knob" style="position: absolute;"></div>
            <div id="e" class="knob" style="position: absolute;"></div>
            <div id="se" class="knob" style="position: absolute;"></div>
            <div id="s" class="knob" style="position: absolute;"></div>
            <div id="sw" class="knob" style="position: absolute;"></div>
            <div id="w" class="knob" style="position: absolute;"></div>
            <div id="nw" class="knob" style="position: absolute;"></div>
            <div id="legend"></div>
        `;
        panelShadowRoot.appendChild(this.frame);
        this.light = panelShadowRoot.querySelector<SVGRectElement>("#light")!;
        this.shade = panelShadowRoot.querySelector<SVGRectElement>("#shade")!;
        this.shade.setAttribute("x", px(0));
        this.shade.setAttribute("y", px(0));
        this.shade.setAttribute("width", "100%");
        this.shade.setAttribute("height", "100%");
        this.canvas = document.createElement("canvas");

        // Initialize.
        this.initializeDragEvents();
        this.initializeSelection();

        // Inject into DOM.
        let container: string | HTMLElement | null = this.options?.container || this.image.parentElement;
        if (typeof container === "string") {
            container = document.querySelector<HTMLElement>(container);
        }
        container?.appendChild(this.panel);
        if (!container) {
            throw new Error("ImagedCrop: Invalid container specified!");
        }
    }

    /**
     * Returns the selection coordinates in image space.
     * @returns { x, y, width, height } The cropped image coordinates.
     */
    toCoordinates(): { x: number; y: number; width: number; height: number } {
        const bounds = this.image.getBoundingClientRect();
        const x = Math.round((this.selection.x1 / bounds.width) * this.image.naturalWidth);
        const x2 = Math.round((this.selection.x2 / bounds.width) * this.image.naturalWidth);
        const y = Math.round((this.selection.y1 / bounds.height) * this.image.naturalHeight);
        const y2 = Math.round((this.selection.y2 / bounds.height) * this.image.naturalHeight);
        const width = x2 - x;
        const height = y2 - y;
        return { x, y, width, height };
    }

    /**
     * This method does two things:
     * 1. Updates the internal canvas object with the cropped image;
     * 2. Returns the internal canvas object.
     * To show this canvas, call this method and insert the returned canvas into the DOM.
     * To update the canvas in real-time, invoke this method from the `onCrop` event handler.
     * @returns HTMLCanvasElement A Canvas object.
     */
    toCanvas(): HTMLCanvasElement {
        const selection = this.toCoordinates();
        this.canvas.width = selection.width;
        this.canvas.height = selection.height;
        const context = this.canvas.getContext("2d");
        if (context) {
            context.fillStyle = this.options?.backgroundColor || "#ffffff";
            context.fillRect(0, 0, selection.width, selection.height);
            context.drawImage(this.image, selection.x, selection.y, selection.width, selection.height, 0, 0, selection.width, selection.height);
        }
        return this.canvas;
    }

    /**
     * Executes the crop and returns the cropped image as a data URL ready to be assigned
     * into the `src` attribute of an `<img>` tag.
     * @param mime An image mime type such as "image/jpeg" or "image/png" (default: "image/png").
     * @param quality A number between 0 and 1 designating encoding quality for lossy formats (e.g. "image/jpeg").
     * @returns string The image data as a data URI.
     */
    toDataUrl(mime: string = "image/png", quality?: number): string {
        const canvas = this.toCanvas();
        return canvas.toDataURL(mime, quality);
    }

    /**
     * Asynchronously executes the crop and returns the cropped image as file data.
     * @param mime An image mime type such as "image/jpeg" or "image/png" (default: "image/png").
     * @param quality A number between 0 and 1 designating encoding quality for lossy formats (e.g. "image/jpeg").
     * @returns Promise<Blob> The image file data.
     */
    async toBlob(mime: string = "image/png", quality?: number): Promise<Blob> {
        const canvas = this.toCanvas();
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject("Failed to crop image!");
                    } else {
                        resolve(blob);
                    }
                },
                mime,
                quality
            );
        });
    }

    /**
     * Destroys the Crop instance and deletes all resources.
     */
    destroy() {
        document.removeEventListener("touchend", this.listeners.dragEnd, false);
        document.removeEventListener("touchmove", this.listeners.drag, false);
        document.removeEventListener("mouseup", this.listeners.dragEnd, false);
        document.removeEventListener("mousemove", this.listeners.drag, false);

        // All other events will be canceled when the panel is removed from DOM.

        this.panel?.remove();
        delete this.image.dataset[instanceKey];
    }
}
