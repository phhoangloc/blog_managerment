"use client";

import { AccountNewPage } from "@/components/AccountEditPage";

export default function NewUserPage() {
  return <AccountNewPage label="user" route="/user" apiPath="/users" />;
}
