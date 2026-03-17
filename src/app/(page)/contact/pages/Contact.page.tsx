/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Github,
  Linkedin,
  Youtube,
  User,
  MessageSquare,
  FileText,
  AtSign,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks";
import { sendContactMessage } from "../../../lib/features/contact/contact.slice";
import {
  selectContactLoading,
  selectContactSuccess,
  selectContactError,
} from "../../../lib/features/contact/contact.selector";
import { clearContactState } from "../../../lib/features/contact/contact.slice";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/gyanaprakashkhandual/",
    icon: <Linkedin className="w-4 h-4" strokeWidth={1.8} />,
    handle: "gyanaprakashkhandual",
  },
  {
    label: "GitHub",
    href: "https://github.com/gyanaprakashkhandual",
    icon: <Github className="w-4 h-4" strokeWidth={1.8} />,
    handle: "gyanaprakashkhandual",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@GyanaprakashKhandual",
    icon: <Youtube className="w-4 h-4" strokeWidth={1.8} />,
    handle: "@GyanaprakashKhandual",
  },
];

const INFO_ITEMS = [
  {
    icon: <MapPin className="w-3.5 h-3.5" strokeWidth={1.8} />,
    label: "Location",
    value: "Bengaluru, Karnataka, India",
    href: null,
  },
  {
    icon: <Phone className="w-3.5 h-3.5" strokeWidth={1.8} />,
    label: "Phone",
    value: "+91 7606939833",
    href: "tel:+917606939833",
  },
  {
    icon: <Mail className="w-3.5 h-3.5" strokeWidth={1.8} />,
    label: "Email",
    value: "gyanprakashkhandual@gmail.com",
    href: "mailto:gyanprakashkhandual@gmail.com",
  },
];

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-gray-400 dark:text-gray-500">{icon}</span>
        <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {label}
        </label>
      </div>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-[11px] text-red-500 dark:text-red-400 flex items-center gap-1"
          >
            <AlertTriangle className="w-3 h-3" strokeWidth={2} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls = (hasError: boolean) => `
  w-full px-3.5 py-2.5 text-xs
  bg-gray-50 dark:bg-gray-900
  border rounded-xl outline-none
  text-gray-800 dark:text-gray-200
  placeholder-gray-400 dark:placeholder-gray-600
  transition-colors
  ${
    hasError
      ? "border-red-300 dark:border-red-800 focus:border-red-400 dark:focus:border-red-600"
      : "border-gray-200 dark:border-gray-800 focus:border-gray-400 dark:focus:border-gray-600"
  }
`;

/* ── Toast Alert Component ───────────────────────────────────────── */
function ToastAlert({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === "success";

  return (
    <motion.div
      initial={{ opacity: 0, y: -24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.96 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-sm min-w-[320px] max-w-[480px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
    >
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          isSuccess
            ? "bg-green-50 dark:bg-green-950/40"
            : "bg-red-50 dark:bg-red-950/40"
        }`}
      >
        {isSuccess ? (
          <CheckCircle2
            className="w-4 h-4 text-green-500 dark:text-green-400"
            strokeWidth={2}
          />
        ) : (
          <AlertTriangle
            className="w-4 h-4 text-red-500 dark:text-red-400"
            strokeWidth={1.8}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900 dark:text-white leading-none mb-0.5">
          {isSuccess ? "Message sent!" : "Something went wrong"}
        </p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
          {message}
        </p>
      </div>

      {/* Auto-drain progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 4, ease: "linear" }}
          className={
            isSuccess
              ? "h-full bg-green-400 dark:bg-green-500"
              : "h-full bg-red-400 dark:bg-red-500"
          }
        />
      </div>

      <button
        onClick={onClose}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export default function ContactPage() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectContactLoading);
  const success = useAppSelector(selectContactSuccess);
  const apiError = useAppSelector(selectContactError);

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const status = loading
    ? "loading"
    : success
      ? "success"
      : apiError
        ? "error"
        : "idle";

  const handleToastClose = useCallback(() => {
    dispatch(clearContactState());
  }, [dispatch]);

  const set = useCallback(
    (field: keyof FormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
        if (success || apiError) dispatch(clearContactState());
      },
    [dispatch, success, apiError],
  );

  const validate = (): boolean => {
    const e: FieldErrors = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email.";
    if (!form.subject.trim()) e.subject = "Subject is required.";
    if (!form.message.trim()) e.message = "Message is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate() || loading) return;
    const result = await dispatch(sendContactMessage(form))
      .unwrap()
      .catch(() => null);
    if (result !== null)
      setForm({ name: "", email: "", subject: "", message: "" });
  }, [dispatch, form, loading]);

  return (
    <>
      {/* ── Toast Portal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {status === "success" && (
          <ToastAlert
            key="success-toast"
            type="success"
            message="Thanks for reaching out. I'll reply to your email soon."
            onClose={handleToastClose}
          />
        )}
        {status === "error" && apiError && (
          <ToastAlert
            key="error-toast"
            type="error"
            message={apiError}
            onClose={handleToastClose}
          />
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-950">
        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="lg:col-span-2 flex flex-col gap-4"
              >
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl overflow-hidden">
                      <img
                        src="https://res.cloudinary.com/dvytvjplt/image/upload/v1765866608/profile_pricture_oemv94.jpg"
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                        Gyana Prakash Khandual
                      </p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                        Full Stack Developer
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {INFO_ITEMS.map((item) => (
                      <div key={item.label} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-gray-500 dark:text-gray-400">
                            {item.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide leading-none mb-1">
                            {item.label}
                          </p>
                          {item.href ? (
                            <a
                              href={item.href}
                              className="text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white truncate block transition-colors"
                            >
                              {item.value}
                            </a>
                          ) : (
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {item.value}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 mb-4">
                    Find me online
                  </p>
                  <div className="space-y-2">
                    {SOCIAL_LINKS.map((s, i) => (
                      <motion.a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.07, duration: 0.3 }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center shrink-0">
                          <span className="text-white dark:text-gray-900">
                            {s.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 leading-none">
                            {s.label}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                            {s.handle}
                          </p>
                        </div>
                        <span className="text-gray-300 dark:text-gray-700 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors text-xs">
                          ↗
                        </span>
                      </motion.a>
                    ))}
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.3 }}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex items-center gap-3"
                >
                  <div className="relative flex items-center justify-center w-2.5 h-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />
                    <span className="relative inline-flex w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-none">
                      Available for work
                    </p>
                    {/* ── Changed: min text-[5px], max xl:text-xs ── */}
                    <p className="text-[5px] xl:text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Open to full-time &amp; freelance
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="lg:col-span-3"
              >
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight mb-1">
                      Send a message
                    </h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                      Fill out the form and I&apos;ll get back to you within
                      24–48 hours.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label="Name"
                        icon={<User className="w-3 h-3" strokeWidth={2} />}
                        error={errors.name}
                      >
                        <input
                          type="text"
                          value={form.name}
                          onChange={set("name")}
                          placeholder="John Doe"
                          className={inputCls(!!errors.name)}
                        />
                      </Field>
                      <Field
                        label="Email"
                        icon={<AtSign className="w-3 h-3" strokeWidth={2} />}
                        error={errors.email}
                      >
                        <input
                          type="email"
                          value={form.email}
                          onChange={set("email")}
                          placeholder="john@example.com"
                          className={inputCls(!!errors.email)}
                        />
                      </Field>
                    </div>

                    <Field
                      label="Subject"
                      icon={<FileText className="w-3 h-3" strokeWidth={2} />}
                      error={errors.subject}
                    >
                      <input
                        type="text"
                        value={form.subject}
                        onChange={set("subject")}
                        placeholder="What's this about?"
                        className={inputCls(!!errors.subject)}
                      />
                    </Field>

                    <Field
                      label="Message"
                      icon={
                        <MessageSquare className="w-3 h-3" strokeWidth={2} />
                      }
                      error={errors.message}
                    >
                      {/* ── Changed: rows 8 → 5 ── */}
                      <textarea
                        value={form.message}
                        onChange={set("message")}
                        placeholder="Write your message here..."
                        rows={8}
                        className={`${inputCls(!!errors.message)} resize-none leading-relaxed`}
                      />
                      <p className="text-[10px] text-gray-300 dark:text-gray-700 text-right -mt-0.5">
                        {form.message.length} / 5000
                      </p>
                    </Field>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={loading}
                      className="
                        w-full flex items-center justify-center gap-2
                        py-3 px-6 rounded-xl
                        bg-gray-900 dark:bg-white
                        text-white dark:text-gray-900
                        text-sm font-semibold
                        hover:opacity-90 disabled:opacity-60
                        transition-opacity shadow-sm
                      "
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {status === "loading" ? (
                          <motion.span
                            key="loading"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2"
                          >
                            <Loader2
                              className="w-4 h-4 animate-spin"
                              strokeWidth={2}
                            />
                            Sending…
                          </motion.span>
                        ) : status === "success" ? (
                          <motion.span
                            key="sent"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                            Message Sent!
                          </motion.span>
                        ) : (
                          <motion.span
                            key="idle"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2"
                          >
                            <Send
                              className="w-4 h-4 translate-x-1px -translate-y-px"
                              strokeWidth={2}
                            />
                            Send Message
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
