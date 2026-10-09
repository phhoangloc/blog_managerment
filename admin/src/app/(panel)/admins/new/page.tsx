"use client";

import { AccountNewPage } from "@/components/AccountEditPage";

export default function NewAdminPage() {
  return <AccountNewPage label="admin" route="/admins" apiPath="/admins" />;
}
