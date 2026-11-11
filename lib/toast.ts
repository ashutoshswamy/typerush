import { sileo } from "sileo";

// Single entry point for every toast in the app (sileo).
export const notify = {
  success: (title: string, description?: string) => sileo.success({ title, description }),
  error: (title: string, description?: string) => sileo.error({ title, description }),
  info: (title: string, description?: string) => sileo.info({ title, description }),
  warning: (title: string, description?: string) => sileo.warning({ title, description }),
};
