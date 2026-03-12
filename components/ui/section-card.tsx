import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type SectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
};

export function SectionCard({
  title,
  description,
  children,
  action,
}: SectionCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-zinc-800 px-5 py-4 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-white md:text-xl">{title}</h2>
            {description ? (
              <p className="text-sm leading-6 text-zinc-400">{description}</p>
            ) : null}
          </div>

          {action ? <div>{action}</div> : null}
        </div>
      </div>

      <div className="p-5 md:p-6">{children}</div>
    </Card>
  );
}