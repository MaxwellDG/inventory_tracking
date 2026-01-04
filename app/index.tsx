import { RootState } from "@/redux/store";
import { Redirect } from "expo-router";
import { useSelector } from "react-redux";

export default function Index() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const user = useSelector((state: RootState) => state.auth.user);

  if (isAuthenticated && user?.company_id) {
    return <Redirect href="/(tabs)/inventory" />;
  }

  return <Redirect href="/(auth)/login" />;
}
