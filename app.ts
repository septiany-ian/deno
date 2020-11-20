import { Application, send } from 'https://deno.land/x/oak/mod.ts';
import userMidleware from './usermiddleware.ts';
import router from './rute.ts';
import "https://deno.land/x/dotenv/load.ts";


const app = new Application();

app.use(userMidleware);
app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (context) => {
    await send(context, context.request.url.pathname, {
      root: `${Deno.cwd()}`
    });
  });

console.log("Service berjalan di port 8000");
await app.listen({port : 8000});
