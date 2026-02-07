"use server";

import { redirect } from "next/navigation";

import { resetDemoData } from "@/server/services/demo-service";

export async function resetDemoAction() {
  await resetDemoData();
  redirect("/console");
}

