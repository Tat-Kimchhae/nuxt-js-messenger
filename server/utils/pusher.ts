import Pusher from "pusher";

const globalForPusher = globalThis as unknown as { pusher: Pusher | undefined };

function createPusherClient() {
  const config = useRuntimeConfig();

  return new Pusher({
    appId: String(config.pusherAppId ?? ""),
    key: String(config.public.pusherKey ?? ""),
    secret: String(config.pusherSecret ?? ""),
    cluster: String(config.public.pusherCluster ?? ""),
    useTLS: true,
  });
}

const pusher = globalForPusher.pusher || createPusherClient();

if (process.env.NODE_ENV !== "production") globalForPusher.pusher = pusher;

export default pusher;
