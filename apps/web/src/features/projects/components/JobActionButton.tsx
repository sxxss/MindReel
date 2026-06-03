import { RefreshCw } from "lucide-react";

import { Button } from "../../../components/ui/button.tsx";

type JobActionButtonProps = {
  label: string;
  pending?: boolean | undefined;
  disabled?: boolean | undefined;
  onClick: () => void;
};

export const JobActionButton = ({ label, pending, disabled, onClick }: JobActionButtonProps) => (
  <Button type="button" variant="outline" onClick={onClick} disabled={pending || disabled}>
    <RefreshCw className="mr-2 size-4" />
    {pending ? "处理中..." : label}
  </Button>
);
