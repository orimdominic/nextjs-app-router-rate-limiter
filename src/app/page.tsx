"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [toastState, setToastState] = useState({
    isVisible: false,
    text: "",
    status: "",
  });

  async function requestResetPassword(email: string) {
    fetch("/api/reset-password-init", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ email }),
    })
      .then(async (res) => {
        const json = await res.json();

        if (!res.ok) {
          throw new Error(
            `${json.error.message}. Retry after ${res.headers.get("Retry-After")}ms`,
          );
        }

        return json;
      })
      .then((json) => {
        setToastState({
          isVisible: true,
          status: "success",
          text: json.message,
        });
      })
      .catch((err) => {
        setToastState({
          isVisible: true,
          status: "error",
          text: err.message,
        });
      });
  }

  return (
    <div className="flex min-h-screen items-center justify-center font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
          <form
            id="form_request_password"
            className="w-full flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              requestResetPassword(email);
            }}
          >
            <h1 className="font-semibold">Request Password Reset Form</h1>
            <label htmlFor="email_input" className="flex flex-col">
              <p className="text-sm">Enter email</p>
              <input
                type="email"
                id="email_input"
                required
                className="px-1 h-8 border rounded w-72"
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <button
              form="form_request_password"
              className="w-fit border px-2 py-1 text-sm rounded"
              type="submit"
            >
              Request password reset
            </button>
            {toastState.isVisible && (
              <p
                onClick={() => {
                  setToastState({
                    isVisible: false,
                    status: "",
                    text: "",
                  });
                }}
                className={`${toastState.status == "success" ? "text-green-500" : "text-red-500"} text-sm hover:cursor-pointer`}
              >
                {toastState.text}
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
