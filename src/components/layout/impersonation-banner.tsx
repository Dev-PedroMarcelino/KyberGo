"use client";

/**
 * Banner de modo suporte: exibido no painel da empresa quando o super admin
 * está impersonando um cliente. Sai do modo e volta ao painel da plataforma.
 */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, LogOut } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getImpersonation, stopImpersonation, type ImpersonationState } from "@/lib/impersonation";

export function ImpersonationBanner() {
  const { t } = useI18n();
  const router = useRouter();
  const [state, setState] = useState<ImpersonationState | null>(null);

  // Lê o localStorage apenas no cliente para não divergir na hidratação.
  useEffect(() => {
    setState(getImpersonation());
  }, []);

  if (!state) return null;

  const exit = () => {
    stopImpersonation();
    setState(null);
    router.push("/admin");
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-amber-400/30 bg-amber-400/[0.08] px-4 py-1.5 text-center">
      <p className="flex items-center gap-2 text-xs font-medium text-amber-300">
        <Eye className="h-3.5 w-3.5" />
        {t("admin.impersonationBanner", { name: state.companyName })}
      </p>
      <button
        onClick={exit}
        className="focus-ring flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold text-amber-200 underline-offset-2 hover:underline"
      >
        <LogOut className="h-3 w-3" />
        {t("admin.impersonationExit")}
      </button>
    </div>
  );
}
