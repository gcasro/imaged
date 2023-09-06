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
declare enum EAspectRule {
    SCALE_WIDTH = 0,
    SCALE_HEIGHT = 1,
    SCALE_BOTH = 2
}
type CropSelection = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};
type KnobCofficients = {
    rule: EAspectRule;
    dx1: number;
    dy1: number;
    dx2: number;
    dy2: number;
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
    readonly options?: Partial<CropOptions> | undefined;
    protected image: HTMLImageElement;
    protected panel: HTMLDivElement;
    protected frame: HTMLDivElement;
    protected light: SVGRectElement;
    protected shade: SVGRectElement;
    protected listeners: {
        [event: string]: (event: any) => void;
    };
    protected canvas: HTMLCanvasElement;
    protected selection: CropSelection;
    protected oldSelection: CropSelection;
    protected minApparentWidth: number;
    protected minApparentHeight: number;
    protected maxApparentWidth: number;
    protected maxApparentHeight: number;
    protected coefficients: {
        [key: string]: KnobCofficients;
    };
    protected activeKnob: string | undefined;
    protected xOffset: number;
    protected yOffset: number;
    protected initializeDragEvents(): void;
    protected initializeSelection(): void;
    protected enforceAspectRatio(selection: CropSelection, coefficients: KnobCofficients, rule: EAspectRule): void;
    protected updateSelection(xDelta: number, yDelta: number): void;
    protected refreshSelection(): void;
    /**
     * Instantiate the Crop over an existing image.
     *
     * @param target The target image to crop (CSS selector string or HTMLImageElement).
     */
    constructor(target: string | HTMLImageElement, options?: Partial<CropOptions> | undefined);
    /**
     * Returns the selection coordinates in image space.
     * @returns { x, y, width, height } The cropped image coordinates.
     */
    toCoordinates(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /**
     * This method does two things:
     * 1. Updates the internal canvas object with the cropped image;
     * 2. Returns the internal canvas object.
     * To show this canvas, call this method and insert the returned canvas into the DOM.
     * To update the canvas in real-time, invoke this method from the `onCrop` event handler.
     * @returns HTMLCanvasElement A Canvas object.
     */
    toCanvas(): HTMLCanvasElement;
    /**
     * Executes the crop and returns the cropped image as a data URL ready to be assigned
     * into the `src` attribute of an `<img>` tag.
     * @param mime An image mime type such as "image/jpeg" or "image/png" (default: "image/png").
     * @param quality A number between 0 and 1 designating encoding quality for lossy formats (e.g. "image/jpeg").
     * @returns string The image data as a data URI.
     */
    toDataUrl(mime?: string, quality?: number): string;
    /**
     * Asynchronously executes the crop and returns the cropped image as file data.
     * @param mime An image mime type such as "image/jpeg" or "image/png" (default: "image/png").
     * @param quality A number between 0 and 1 designating encoding quality for lossy formats (e.g. "image/jpeg").
     * @returns Promise<Blob> The image file data.
     */
    toBlob(mime?: string, quality?: number): Promise<Blob>;
    /**
     * Destroys the Crop instance and deletes all resources.
     */
    destroy(): void;
}
export {};
