import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Records one pageview per mount on the public site. */
export function PageviewTracker() {
  useEffect(() => {
    // Count every visit — preview and published site alike.
    void supabase.from("pageviews").insert({
      path: window.location.pathname,
      referrer: document.referrer || "",
      user_agent: navigator.userAgent || "",
    });
  }, []);
  return null;
}
