"use client";

import { useEffect, useState } from "react";
import type { SiteContent } from "@/content/site-content-types";
import { getText } from "@/content/site-content-types";
import { getClinicStatus, type ClinicHoursData } from "@/lib/clinicHours";
import styles from "./ClinicOpenStatus.module.css";

export function ClinicOpenStatus({ content, className = "" }: { content: SiteContent; className?: string }) {
  const hours: ClinicHoursData = Object.fromEntries(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => [day, getText(content, `clinic.hours.${day}`)]));
  const [status, setStatus] = useState<ReturnType<typeof getClinicStatus>>(null);

  useEffect(() => {
    const update = () => setStatus(getClinicStatus(hours));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [hours.monday, hours.tuesday, hours.wednesday, hours.thursday, hours.friday, hours.saturday, hours.sunday]);

  if (!status) return null;
  return <span className={`${styles.status} ${styles[status]} ${className}`} suppressHydrationWarning>{getText(content, `common.status.${status}`)}</span>;
}
