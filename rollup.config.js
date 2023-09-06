import css from "rollup-plugin-import-css";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default [
    {
        input: "src/Crop.ts",
        output: {
            file: "dist/Crop.js",
            format: "umd",
            name: "Crop",
            sourcemap: true,
        },
        plugins: [css(), terser(), typescript()],
    },
];
