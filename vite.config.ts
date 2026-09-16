import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // @mui/icons-material v5 has no "exports" map, so its subpath files
      // (e.g. @mui/icons-material/Report) resolve to the CJS build. When
      // esbuild pre-bundles a dependency that default-imports one of those
      // - react-admin does, all over its layout - the interop yields the
      // module namespace ({ default }) instead of the icon component, and
      // React throws "Element type is invalid ... but got: object".
      // Pointing subpath imports at the ESM build sidesteps the interop.
      // Can be dropped once @mui/* is on v7, which ships an exports map.
      {
        find: /^@mui\/icons-material\/(?!esm\/)(.+)$/,
        replacement: '@mui/icons-material/esm/$1',
      },
    ],
  },
})
