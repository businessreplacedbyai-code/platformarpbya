"use client";

import { useRef } from "react";

export function AgentStatusSelect({
  defaultValue,
  name = "status",
}: {
  defaultValue: string;
  name?: string;
}) {
  const ref = useRef<HTMLSelectElement>(null);
  return (
    <select
      ref={ref}
      name={name}
      defaultValue={defaultValue}
      onChange={() => ref.current?.form?.requestSubmit()}
      className="text-[11.5px] px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--bg-2)] cursor-pointer"
    >
      <option value="planned">planned</option>
      <option value="configuring">configuring</option>
      <option value="testing">testing</option>
      <option value="live">live</option>
      <option value="paused">paused</option>
    </select>
  );
}
