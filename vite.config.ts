import { UserConfig, ConfigEnv } from 'vite';
import { resolve } from 'path';
import { createVitePlugins } from './config/vite/plugin';

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir);
}

// https://vitejs.dev/config/
export default ({ command, mode }: ConfigEnv): UserConfig => {
  const isBuild = command === 'build';
  console.log(command, mode);

  return {
    resolve: {
      alias: [
        // /@/xxxx => src/xxxx
        { find: /^~/, replacement: resolve(__dirname, '') },
        {
          find: /\/@\//,
          replacement: pathResolve('src') + '/',
        },
      ],
    },

    // plugins
    plugins: createVitePlugins(isBuild),
  };
};
