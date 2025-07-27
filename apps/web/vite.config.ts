import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
    server: {
        host: "::",
        port: 8080
    },
    plugins: [
        react(),
        tsconfigPaths()
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    esbuild: {
        keepNames: true,
        target: 'es2020'
    }
});