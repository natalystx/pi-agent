import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import pstack from "../../npm/node_modules/pi-pstack/extensions/pstack/index.ts";

// Loads pi-pstack with two fixes. settings.json loads pi-pstack with
// "extensions": [] so only this copy runs.
// 1. pi-pstack and pi-interactive-subagents both register a tool named
//    "subagent", and pi refuses to start on duplicate tool names. Skip
//    pstack's so pi-interactive-subagents owns that name.
// 2. pstack's /poteto-mode calls ctx.sendUserMessage, which pi only provides
//    on the extension API. Supply it, expanding /skill: commands like a typed
//    message would.
export default function (pi: ExtensionAPI) {
  type SendOptions = Parameters<ExtensionAPI["sendUserMessage"]>[1];
  const withCommandSend = (ctx: object) =>
    new Proxy(ctx, {
      get(target, prop) {
        if (prop === "sendUserMessage" && !(prop in target)) {
          return (content: Parameters<ExtensionAPI["sendUserMessage"]>[0], options?: SendOptions) => {
            const idle = (target as { isIdle?: () => boolean }).isIdle?.() ?? true;
            pi.sendUserMessage(content, {
              expandPromptTemplates: true,
              ...(idle ? {} : { deliverAs: "followUp" }),
              ...options,
            });
          };
        }
        const value = Reflect.get(target, prop, target);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });

  const patched = new Proxy(pi, {
    get(target, prop, receiver) {
      if (prop === "registerTool") {
        return (tool: { name: string }) => {
          if (tool.name !== "subagent") target.registerTool(tool as never);
        };
      }
      if (prop === "registerCommand") {
        return (name: string, command: { handler: (args: string, ctx: object) => unknown }) =>
          target.registerCommand(name, {
            ...command,
            handler: (args: string, ctx: object) => command.handler(args, withCommandSend(ctx)),
          } as never);
      }
      const value = Reflect.get(target, prop, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
  pstack(patched);
}
