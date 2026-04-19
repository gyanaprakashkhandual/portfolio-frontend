/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import {
  Shield,
  RefreshCw,
  CheckCircle,
  ChevronDown,
  Copy,
  Check,
  Lock,
  Unlock,
  AlertTriangle,
  Layers,
  Diff,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: easeInOut },
  }),
};

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="relative group my-3">
      <pre className="bg-black dark:bg-zinc-900 text-zinc-100 rounded-xl px-5 py-4 text-sm font-mono overflow-x-auto leading-relaxed border border-zinc-800">
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg p-1.5"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
    </div>
  );
}

function Badge({
  children,
  color = "zinc",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  const colors: Record<string, string> = {
    zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    emerald:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
}

const commands = [
  {
    cmd: "encrypt",
    icon: <Lock size={16} />,
    desc: "Reads .env, encrypts every value with AES-256-GCM, writes .env.encrypted, and updates .gitignore.",
    color: "emerald",
    flags: [
      { flag: "--input, -i", desc: "Source .env path", default: ".env" },
      {
        flag: "--output, -o",
        desc: "Encrypted output path",
        default: ".env.encrypted",
      },
      { flag: "--env, -e", desc: "Named environment profile", default: "—" },
      {
        flag: "--iterations",
        desc: "PBKDF2 iteration count (min 100,000)",
        default: "200000",
      },
      {
        flag: "--overwrite",
        desc: "Overwrite existing encrypted file",
        default: "false",
      },
      {
        flag: "--no-gitignore",
        desc: "Skip .gitignore management",
        default: "false",
      },
    ],
  },
  {
    cmd: "decrypt",
    icon: <Unlock size={16} />,
    desc: "Reads .env.encrypted, verifies HMAC integrity, decrypts values, writes .env.",
    color: "blue",
    flags: [
      {
        flag: "--input, -i",
        desc: "Encrypted file path",
        default: ".env.encrypted",
      },
      { flag: "--output, -o", desc: "Decrypted output path", default: ".env" },
      { flag: "--env, -e", desc: "Named environment profile", default: "—" },
      {
        flag: "--overwrite",
        desc: "Overwrite existing .env file",
        default: "false",
      },
    ],
  },
  {
    cmd: "check",
    icon: <CheckCircle size={16} />,
    desc: "Verifies the HMAC integrity of .env.encrypted without decrypting. Exits 0 on success.",
    color: "zinc",
    flags: [],
  },
  {
    cmd: "diff",
    icon: <Diff size={16} />,
    desc: "Compares key names between .env and .env.encrypted. Does not decrypt values.",
    color: "zinc",
    flags: [],
  },
  {
    cmd: "rotate",
    icon: <RefreshCw size={16} />,
    desc: "Re-encrypts .env.encrypted with a new passphrase. Does not need the plain-text .env.",
    color: "amber",
    flags: [],
  },
  {
    cmd: "init",
    icon: <Layers size={16} />,
    desc: "Creates a .env.example template from existing .env key names and configures .gitignore.",
    color: "zinc",
    flags: [],
  },
];

function CommandAccordion({ c, i }: { c: (typeof commands)[0]; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      custom={i}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left"
      >
        <span className="text-zinc-500">{c.icon}</span>
        <span className="font-mono font-semibold text-sm text-black dark:text-white">
          sendenv {c.cmd}
        </span>
        <span className="ml-auto text-zinc-400 flex items-center gap-2 text-xs">
          {c.flags.length > 0 && <Badge>{c.flags.length} flags</Badge>}
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-4 mb-3">
                {c.desc}
              </p>
              <CodeBlock code={`npx sendenv ${c.cmd}`} />
              {c.flags.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800">
                        <th className="text-left py-2 pr-4 text-zinc-500 font-medium">
                          Flag
                        </th>
                        <th className="text-left py-2 pr-4 text-zinc-500 font-medium">
                          Description
                        </th>
                        <th className="text-left py-2 text-zinc-500 font-medium">
                          Default
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.flags.map((f) => (
                        <tr
                          key={f.flag}
                          className="border-b border-zinc-100 dark:border-zinc-800/50 last:border-0"
                        >
                          <td className="py-2 pr-4 font-mono text-black dark:text-white whitespace-nowrap">
                            {f.flag}
                          </td>
                          <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">
                            {f.desc}
                          </td>
                          <td className="py-2 font-mono text-zinc-500">
                            {f.default}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const steps = [
  {
    n: "01",
    title: "Encrypt your .env",
    body: "Run encrypt in your project root. sendenv reads every key-value pair and encrypts the values using AES-256-GCM with a passphrase-derived key.",
    code: "npx sendenv encrypt",
  },
  {
    n: "02",
    title: "Commit .env.encrypted",
    body: "Your .gitignore is updated automatically to block the plain-text .env. Push the encrypted file as a normal git artifact.",
    code: "git add .env.encrypted && git commit -m 'add encrypted env'",
  },
  {
    n: "03",
    title: "Teammates decrypt",
    body: "A teammate clones the repo, runs decrypt, enters the shared passphrase, and gets a working .env in seconds. No Slack DMs.",
    code: "npx sendenv decrypt",
  },
];

const securityPoints = [
  "PBKDF2-HMAC-SHA256 key derivation — 200,000 iterations, 32-byte salt",
  "AES-256-GCM per-value encryption with a unique 12-byte IV per value",
  "File-level HMAC-SHA256 integrity — tampering is detected before decryption",
  "Passphrase and derived key are zeroed in memory after use",
  "No network calls, no telemetry, no external services",
];

export default function SendenvDocs() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">
      <div className="max-w-5xl mx-auto px-5 pb-1">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="pt-20 pb-16 border-b border-zinc-200 dark:border-zinc-800"
        >
          <div className="flex items-center gap-2 mb-6">
            <Badge color="emerald">v1</Badge>
            <Badge>MIT</Badge>
            <Badge>No dependencies</Badge>
          </div>
          <h1 className="text-5xl font-bold tracking-tight leading-[1.05] mb-5">
            Send ENV
          </h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 max-w-xl">
            Encrypt your{" "}
            <code className="text-black dark:text-white font-mono text-base">
              .env
            </code>{" "}
            file and share it safely through git. Teammates decrypt with a
            shared passphrase. No third-party service.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <CodeBlock code="npx sendenv encrypt" />
            <CodeBlock code="npx sendenv decrypt" />
          </div>
        </motion.div>

        <section className="py-14 border-b border-zinc-200 dark:border-zinc-800">
          <motion.p
            custom={0}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-8"
          >
            The problem
          </motion.p>
          <motion.div
            custom={1}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="flex gap-4 p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl mb-4"
          >
            <AlertTriangle
              size={18}
              className="text-amber-500 shrink-0 mt-0.5"
            />
            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong>.env</strong> files cannot be committed. Secrets end up in
              Slack messages, email threads, and README files. New developers
              are blocked on day one. When a secret rotates, not everyone gets
              updated.
            </p>
          </motion.div>
          <motion.p
            custom={2}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed"
          >
            sendenv solves this by treating the encrypted file as a regular git
            artifact. Key names remain visible. Values do not.
          </motion.p>
        </section>

        <section className="py-14 border-b border-zinc-200 dark:border-zinc-800">
          <motion.p
            custom={0}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-10"
          >
            How it works
          </motion.p>
          <div className="space-y-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                custom={i + 1}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex gap-6"
              >
                <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-bold">
                  {s.n}
                </div>
                <div className="flex-1 pt-1.5">
                  <h3 className="font-semibold text-base mb-1">{s.title}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
                    {s.body}
                  </p>
                  <CodeBlock code={s.code} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="py-14 border-b border-zinc-200 dark:border-zinc-800">
          <motion.p
            custom={0}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-8"
          >
            Installation
          </motion.p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Run once (no install)", code: "npx sendenv <command>" },
              { label: "Global install", code: "npm install -g sendenv" },
              {
                label: "Dev dependency",
                code: "npm install --save-dev sendenv",
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                custom={i + 1}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4"
              >
                <p className="text-xs text-zinc-500 mb-3 font-medium">
                  {item.label}
                </p>
                <CodeBlock code={item.code} />
              </motion.div>
            ))}
          </div>
          <motion.div
            custom={4}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-4 flex items-center gap-2 text-sm text-zinc-500"
          >
            <CheckCircle size={13} className="text-emerald-500" />
            Requires Node.js 18 or later. No production dependencies.
          </motion.div>
        </section>

        <section className="py-14 border-b border-zinc-200 dark:border-zinc-800">
          <motion.p
            custom={0}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-8"
          >
            Commands
          </motion.p>
          <div className="space-y-2">
            {commands.map((c, i) => (
              <CommandAccordion key={c.cmd} c={c} i={i} />
            ))}
          </div>
        </section>

        <section className="py-14 border-b border-zinc-200 dark:border-zinc-800">
          <motion.p
            custom={0}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-8"
          >
            Environment profiles
          </motion.p>
          <motion.p
            custom={1}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-sm text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed"
          >
            Use{" "}
            <code className="text-black dark:text-white font-mono">--env</code>{" "}
            to manage multiple environments from one project. sendenv reads{" "}
            <code className="font-mono text-black dark:text-white">
              .env.staging
            </code>
            , writes{" "}
            <code className="font-mono text-black dark:text-white">
              .env.staging.encrypted
            </code>
            , and follows the same naming pattern for all commands.
          </motion.p>
          <motion.div
            custom={2}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <CodeBlock
              code={`# Encrypt staging\nnpx sendenv encrypt --env staging\n\n# Decrypt on another machine\nnpx sendenv decrypt --env staging`}
            />
          </motion.div>
          <motion.div
            custom={3}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-6"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
              Or configure profiles in{" "}
              <code className="font-mono text-black dark:text-white">
                sendenv.config.json
              </code>
              :
            </p>
            <CodeBlock
              lang="json"
              code={`{
  "iterations": 200000,
  "gitignore": true,
  "profiles": {
    "staging": {
      "input": ".env.staging",
      "output": ".env.staging.encrypted"
    },
    "production": {
      "input": ".env.production",
      "output": ".env.production.encrypted"
    }
  }
}`}
            />
          </motion.div>
        </section>

        <section className="py-14 border-b border-zinc-200 dark:border-zinc-800">
          <motion.p
            custom={0}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-8"
          >
            Encrypted file format
          </motion.p>
          <motion.p
            custom={1}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-sm text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed"
          >
            <code className="font-mono text-black dark:text-white">
              .env.encrypted
            </code>{" "}
            is a plain-text file safe to open in any editor or diff tool. Key
            names are visible. Values are not.
          </motion.p>
          <motion.div
            custom={2}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <CodeBlock
              code={`# sendenv encrypted file
# Do not edit manually. Use sendenv to modify values.
# sendenv_VERSION=1
# sendenv_SALT=<base64 encoded salt>
# sendenv_ITERATIONS=200000
# sendenv_HMAC=<base64 encoded HMAC-SHA256>

DATABASE_URL=enc:aGVsbG8gd29ybGQgdGhpcyBpcyBhIHRlc3Q...
STRIPE_SECRET=enc:c29tZSByYW5kb20gZW5jcnlwdGVkIGRhdGE...
NODE_ENV=enc:cHJvZHVjdGlvbiBtb2Rl...`}
            />
          </motion.div>
        </section>

        <section className="py-14 border-b border-zinc-200 dark:border-zinc-800">
          <motion.p
            custom={0}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-8"
          >
            CI usage
          </motion.p>
          <motion.p
            custom={1}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-sm text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed"
          >
            Store the passphrase as a repository secret. Pass it via the{" "}
            <code className="font-mono text-black dark:text-white">--key</code>{" "}
            flag or the{" "}
            <code className="font-mono text-black dark:text-white">
              sendenv_KEY
            </code>{" "}
            environment variable. Do not write the decrypted .env to disk in CI.
          </motion.p>
          <motion.div
            custom={2}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <CodeBlock
              lang="yaml"
              code={`- name: Verify encrypted env file
  run: npx sendenv check
  env:
    sendenv_KEY: \${{ secrets.sendenv_KEY }}`}
            />
          </motion.div>
        </section>

        <section className="py-14">
          <motion.p
            custom={0}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-8"
          >
            Security
          </motion.p>
          <div className="space-y-3">
            {securityPoints.map((pt, i) => (
              <motion.div
                key={pt}
                custom={i + 1}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex items-start gap-3"
              >
                <Shield size={14} className="text-emerald-500 shrink-0 mt-1" />
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {pt}
                </p>
              </motion.div>
            ))}
          </div>
          <motion.div
            custom={7}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-8 p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              The passphrase must be shared through a secure out-of-band channel
              such as a shared password manager. sendenv does not handle
              passphrase distribution.
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mt-3">
              If{" "}
              <code className="font-mono text-black dark:text-white">.env</code>{" "}
              was committed to git at any point in the past, the secret exists
              in git history. Rotate all affected credentials before using
              sendenv.
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
