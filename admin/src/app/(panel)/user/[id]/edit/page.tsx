"use client";

import { AccountEditPage } from "@/components/AccountEditPage";

export default function UserEditPage() {
  return <AccountEditPage label="user" route="/user" apiPath="/users" />;
}
