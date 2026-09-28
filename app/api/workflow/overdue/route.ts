import { serve } from "@upstash/workflow/nextjs";
import { checkAndNotifyOverdueBorrows } from "@/lib/overdue";

export const { POST } = serve(async (context) => {
  const result = await context.run("scan-and-notify-overdue", async () => {
    return await checkAndNotifyOverdueBorrows();
  });

  return result;
});
