import esbuildPluginTsc from "esbuild-plugin-tsc";

export default () => {
    return {
        bundle: true,
        minify: true,
        sourcemap: false,
        exclude: ["@aws-sdk/*"],
        external: ["@aws-sdk/*"],
        plugins: [esbuildPluginTsc()],
    };
};
