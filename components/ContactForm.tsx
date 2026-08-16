"use client";

import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const result = await response.json().catch(() => ({}));

    if (response.ok) {
      event.currentTarget.reset();
      setMessage("Thanks — your message is with the Metro Manila Movies team.");
      setState("sent");
    } else {
      setMessage(result.error || "Something went wrong. Please use WhatsApp instead.");
      setState("error");
    }
  }

  return <form className="contact-form" onSubmit={submit}>
    <label>Name<input name="name" required maxLength={160} autoComplete="name" /></label>
    <label>Email<input name="email" required type="email" maxLength={320} autoComplete="email" /></label>
    <label>Subject <span>(optional)</span><input name="subject" maxLength={200} /></label>
    <label>Message<textarea name="message" required maxLength={5000} rows={4} /></label>
    <input className="website" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    <button className="dark-button" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send message"}</button>
    {state !== "idle" && <p className={`form-status ${state}`}>{message}</p>}
  </form>;
}
