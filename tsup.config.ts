import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    core: 'src/core.ts',
    form: 'src/form.ts',
    overlay: 'src/overlay.ts',
    navigation: 'src/navigation.ts',
    chart: 'src/chart.ts',
    'data-table': 'src/data-table.ts',
    'auto-form': 'src/auto-form.ts',
    hooks: 'src/hooks/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'next'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
  splitting: true,
  treeshake: true,
});
