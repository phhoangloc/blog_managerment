import AccountList from "@/components/AccountList";

export default function UserListPage() {
  return <AccountList title="User" route="/user" apiPath="/users" newLabel="New user" />;
}
