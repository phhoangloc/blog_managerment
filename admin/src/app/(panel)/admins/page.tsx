import AccountList from "@/components/AccountList";

export default function AdminListPage() {
  return <AccountList title="Admin" route="/admins" apiPath="/admins" newLabel="New admin" />;
}
