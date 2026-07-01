import { createClient } from "@supabase/supabase-js";

export async function cleanupE2EData(prefix: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.warn(
      "⚠️  Cleanup skipped: SUPABASE_SERVICE_ROLE_KEY not available. Manual cleanup may be needed."
    );
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // Delete expenses with E2E prefix
    const { error: expenseError } = await supabase
      .from("expenses")
      .delete()
      .ilike("description", `${prefix}%`);

    if (expenseError) {
      console.error("❌ Error deleting E2E expenses:", expenseError);
    } else {
      console.log("✅ Cleaned up E2E expenses");
    }

    // Delete schedule events with E2E prefix
    const { error: eventError } = await supabase
      .from("schedule_events")
      .delete()
      .ilike("title", `${prefix}%`);

    if (eventError) {
      console.error("❌ Error deleting E2E events:", eventError);
    } else {
      console.log("✅ Cleaned up E2E schedule events");
    }
  } catch (error) {
    console.error("❌ Cleanup error:", error);
  }
}
