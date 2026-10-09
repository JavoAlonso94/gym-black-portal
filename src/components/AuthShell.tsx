import type { ReactNode } from "react";
import logo from "@/assets/gym-black-logo.jpg";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden items-center justify-center overflow-hidden bg-sidebar lg:flex">
        <img src={logo} alt="Gym Black" className="w-[85%] max-w-xl object-contain" />
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <img src={logo} alt="Gym Black" className="mx-auto mb-6 w-40 rounded-lg lg:hidden" />
          <p className="text-xs font-semibold uppercase tracking-brand text-primary">Gym Black</p>
          <h1 className="mt-2 text-3xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-10 text-center text-[10px] uppercase tracking-brand text-muted-foreground">
            Disciplina • Fuerza • Enfoque • Resultados
          </p>
        </div>
      </div>
    </div>
  );
}

export function RolePicker({ value, onChange, roles }: { value: string; onChange: (r: any) => void; roles: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {roles.map((r) => (
        <button type="button" key={r} onClick={() => onChange(r)}
          className={`rounded-md border px-3 py-2 text-sm transition ${value === r ? "border-primary bg-primary/10 text-primary" : "hover:border-primary/50"}`}>
          {r}
        </button>
      ))}
    </div>
  );
}
