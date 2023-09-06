# GCAS Imaged Tools

A no-dependency toolset for manipulating images in the browser.
Currently only `Crop` is implemented.

### Features:

-   Lightweight;
-   No-dependencies;
-   Uses Shadow DOM (doesn't affect external CSS);
-   Invoked with a simple call;
-   Does not change existing DOM elements (other than inserting a single absolutely-positioned div);
-   TypeScript.

## Crop ([demo](https://vpalos.com/2023/03/19/ad-hoc-image-cropper/))

In-place cropping tool intended for (but not limited to) selecting images for upload. Just invoke the `Crop` object on any image you have in the DOM.

> See demo in `/test/crop.html` file.

Doesn't alter the original image element at all, it just overlays ontop of it; this means you can place and style your source image however you like before cropping.

### Layout requirement

**Important!** The source image must reside in a relatively positioned container and the container must take the exact size of the image.

> I found this to be is the easiest way to implement perfect crop layout regardless of scenario. Making the tool auto-responsive without this requirement would complicate things a lot (observers, events, altering the DOM... and still not perfect).

### Usage

-   Load `dist/Crop.js` on your page, however you like:
    -   use `<script src=".../Crop.js">` in the browser;
    -   use `import Crop from "@gcas/imaged/dist/Crop";` if in modules (e.g. typescript);
-   Ensure the source image exists on the page in the following layout:
    ```html
    <div style="position: relative; display: inline-flex">
        <img id="source" src="..." ... crossorigin />
    </div>
    ```
    -   `position: relative` is important so Crop can take the size of this container (`absolute` or `fixed` are also fine);
    -   `display: inline-flex` is only used here to make sure the container takes the exact size of the image;
    -   `crossorigin` is also important (required for internal canvas);
-   Once the image loads, call `new Crop("#source", { /* options */ })`;
-   Done.

### Documentation

I had no time for that; please see the comments in `src/Crop.ts` and the exposed (public) methods.

See also the `test/crop.html` file for usage examples.
