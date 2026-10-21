import PusherClient from "pusher-js";

type ChannelHandlers = Record<string, (payload: unknown) => void>;

let pusherClient: PusherClient | null = null;

export function usePusher() {
  const config = useRuntimeConfig();

  function getPusherClient() {
    if (!import.meta.client) return null;
    if (pusherClient) return pusherClient;

    pusherClient = new PusherClient(String(config.public.pusherKey), {
      cluster: String(config.public.pusherCluster),
      channelAuthorization: {
        endpoint: "/api/pusher/auth",
        transport: "ajax",
      },
    });

    return pusherClient;
  }

  function subscribeToChannel(channelName: string, handlers: ChannelHandlers) {
    const client = getPusherClient();
    if (!client) return () => {};

    const channel = client.subscribe(channelName);
    for (const [eventName, handler] of Object.entries(handlers)) {
      channel.bind(eventName, handler);
    }

    return () => {
      for (const [eventName, handler] of Object.entries(handlers)) {
        channel.unbind(eventName, handler);
      }
      client.unsubscribe(channelName);
    };
  }

  function subscribeToConversation(id: string, handlers: ChannelHandlers) {
    return subscribeToChannel(`private-conversation-${id}`, handlers);
  }

  function subscribeToUserChannel(userId: string, handlers: ChannelHandlers) {
    return subscribeToChannel(`private-user-${userId}`, handlers);
  }

  return { subscribeToConversation, subscribeToUserChannel };
}
