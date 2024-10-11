import { Outlet, redirect } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  if (url.pathname === "/trivia") {
    return redirect("/");
  }
  return null;
};

export default function TriviaLayout() {
  return (
    <div className="trivia-layout">
      <Outlet />
    </div>
  );
}