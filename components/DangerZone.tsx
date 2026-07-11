"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Trash2, TriangleAlert, X, FileSpreadsheet } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { exportUserData, deleteAllTestData, getRecentResults } from "@/lib/firestore";
import { Panel } from "./Panel";
import { PasswordInput } from "./PasswordInput";

const CSV_COLUMNS = [
  "date",
  "mode",
  "duration",
  "wordCount",
  "punctuation",
  "numbers",
  "language",
  "wpm",
  "wpmNet",
  "accuracy",
  "consistency",
  "correct",
  "incorrect",
  "extra",
  "missed",
  "elapsedSeconds",
] as const;

function csvCell(value: unknown): string {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function DangerZone({ uid, username }: { uid: string; username: string }) {
  const { user, deleteAccount } = useAuth();
  const router = useRouter();

  const [exporting, setExporting] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [armed, setArmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState("");
  const isPasswordAccount = user?.providerData[0]?.providerId === "password";

  const [dataArmed, setDataArmed] = useState(false);
  const [clearingData, setClearingData] = useState(false);
  const [dataCleared, setDataCleared] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  async function handleClearData() {
    if (!dataArmed) {
      setDataArmed(true);
      return;
    }
    setClearingData(true);
    setDataError(null);
    try {
      await deleteAllTestData(uid);
      setDataCleared(true);
      setDataArmed(false);
    } catch (err) {
      console.warn("clear data failed:", err);
      setDataError(`Couldn't clear data: ${err instanceof Error ? err.message : String(err)}`);
      setDataArmed(false);
    } finally {
      setClearingData(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const data = await exportUserData(uid);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `typerush-${username}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  async function handleExportCsv() {
    setExportingCsv(true);
    try {
      const results = await getRecentResults(uid, 5000);
      const rows = results.map((r) =>
        [
          r.createdAt?.toDate?.().toISOString() ?? "",
          r.mode,
          r.config.duration ?? "",
          r.config.wordCount ?? "",
          r.config.punctuation,
          r.config.numbers,
          r.config.language,
          r.wpm,
          r.wpmNet,
          r.accuracy,
          r.consistency,
          r.charStats.correct,
          r.charStats.incorrect,
          r.charStats.extra,
          r.charStats.missed,
          r.elapsedSeconds,
        ]
          .map(csvCell)
          .join(",")
      );
      const csv = [CSV_COLUMNS.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `typerush-${username}-results.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportingCsv(false);
    }
  }

  async function handleDelete() {
    if (!armed) {
      setArmed(true);
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount(passwordRequired ? password : undefined);
      router.push("/");
    } catch (err) {
      console.warn("delete account failed:", err);
      const code = (err as { code?: string }).code;
      if (code === "auth/requires-recent-login" && isPasswordAccount && !passwordRequired) {
        // First attempt without a password — ask for it inline instead of
        // forcing a full sign-out/sign-in round trip.
        setPasswordRequired(true);
        setDeleting(false);
        return;
      }
      setError(
        code === "auth/requires-recent-login"
          ? "Reauthentication was cancelled — try deleting again to confirm your identity."
          : code === "permission-denied"
            ? "Firestore rules on the live project don't allow this yet — deploy firestore.rules and retry."
            : code === "auth/wrong-password" || code === "auth/invalid-credential"
              ? "That password's wrong — try again."
              : `Couldn't delete account: ${err instanceof Error ? err.message : String(err)}`
      );
      setArmed(false);
      setDeleting(false);
      setPasswordRequired(false);
      setPassword("");
    }
  }

  return (
    <Panel className="flex flex-col gap-4 px-5 py-5">
      <h2 className="flex items-center gap-1.5 text-error text-xs tracking-[0.15em] uppercase">
        <TriangleAlert size={14} aria-hidden="true" />
        danger zone
      </h2>

      <div className="flex flex-col gap-1.5">
        <p className="text-sub text-sm">Download every test result, personal best, and profile field as JSON.</p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 text-main hover:underline text-xs tracking-[0.1em] uppercase w-fit disabled:opacity-50"
          >
            <Download size={13} aria-hidden="true" />
            {exporting ? "preparing…" : "export my data (json)"}
          </button>
          <button
            onClick={handleExportCsv}
            disabled={exportingCsv}
            className="flex items-center gap-1.5 text-main hover:underline text-xs tracking-[0.1em] uppercase w-fit disabled:opacity-50"
          >
            <FileSpreadsheet size={13} aria-hidden="true" />
            {exportingCsv ? "preparing…" : "export results (csv)"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-sub/15 pt-4">
        <p className="text-sub text-sm">
          Wipes test history, personal bests, race history, leaderboard entries, and resets xp/level back to zero.
          Your account, username, and friends list stay — this can&rsquo;t be undone.
        </p>
        <motion.button
          variants={{ idle: { x: 0 }, armed: { x: [0, -5, 5, -3, 3, 0] } }}
          animate={dataArmed ? "armed" : "idle"}
          transition={{ duration: 0.35 }}
          onClick={handleClearData}
          disabled={clearingData}
          className={`flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase w-fit disabled:opacity-50 ${
            dataArmed ? "bg-error text-bg px-3 py-2" : "text-error hover:underline"
          }`}
        >
          <Trash2 size={13} aria-hidden="true" />
          {clearingData ? "clearing…" : dataArmed ? "confirm — delete all data" : "delete all data"}
        </motion.button>
        <AnimatePresence>
          {dataArmed && !clearingData && (
            <motion.button
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => setDataArmed(false)}
              className="flex items-center gap-1.5 text-sub hover:text-text text-xs tracking-[0.1em] uppercase w-fit"
            >
              <X size={13} aria-hidden="true" />
              cancel
            </motion.button>
          )}
        </AnimatePresence>
        {dataCleared && <p className="text-sub text-xs">All test data cleared.</p>}
        {dataError && <p className="text-error text-xs">{dataError}</p>}
      </div>

      <div className="flex flex-col gap-1.5 border-t border-sub/15 pt-4">
        <p className="text-sub text-sm">
          Deletes your account, test history, personal bests, and leaderboard entries. This can&rsquo;t be undone
          — export first if you want to keep a copy.
        </p>
        <AnimatePresence>
          {passwordRequired && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-64"
            >
              <PasswordInput value={password} onChange={setPassword} placeholder="confirm your password" autoFocus />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          variants={{ idle: { x: 0 }, armed: { x: [0, -5, 5, -3, 3, 0] } }}
          animate={armed ? "armed" : "idle"}
          transition={{ duration: 0.35 }}
          onClick={handleDelete}
          disabled={deleting || (passwordRequired && !password)}
          className={`flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase w-fit disabled:opacity-50 ${
            armed ? "bg-error text-bg px-3 py-2" : "text-error hover:underline"
          }`}
        >
          <Trash2 size={13} aria-hidden="true" />
          {deleting
            ? "deleting…"
            : passwordRequired
              ? "confirm password — delete everything"
              : armed
                ? "confirm — delete everything"
                : "delete my account"}
        </motion.button>
        <AnimatePresence>
          {armed && !deleting && (
            <motion.button
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setArmed(false);
                setPasswordRequired(false);
                setPassword("");
              }}
              className="flex items-center gap-1.5 text-sub hover:text-text text-xs tracking-[0.1em] uppercase w-fit"
            >
              <X size={13} aria-hidden="true" />
              cancel
            </motion.button>
          )}
        </AnimatePresence>
        {error && <p className="text-error text-xs">{error}</p>}
      </div>
    </Panel>
  );
}
