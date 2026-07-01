import { defineConfig } from 'orval';

export default defineConfig({
  scrai: {
    input: './openapi.json',
    output: {
      mode: 'single',
      target: './src/generated/scrai.ts',
      schemas: './src/generated/model',
      client: 'react-query',
      prettier: false,
      override: {
        // Return the response body directly (not a {data,status,headers} wrapper),
        // matching the custom mutator which resolves to the parsed JSON.
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: './src/mutator.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
