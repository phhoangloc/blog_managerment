"use client";

import { AccountEditPage } from "@/components/AccountEditPage";

export default function AdminEditPage() {
  return <AccountEditPage label="admin" route="/admins" apiPath="/admins" />;
}
