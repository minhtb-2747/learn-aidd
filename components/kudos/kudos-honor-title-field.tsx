"use client";

export interface KudosHonorTitleFieldProps {
  label: string;
  placeholder: string;
  help: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * "Danh hiệu*" field of the Write/Edit-Kudos dialog (MoMorph node
 * `520:9871` create, `1949:13746` edit) — a required text input plus its
 * help copy. Split out of `write-kudos-dialog.tsx` to keep that file under
 * the 200-line guideline.
 */
export default function KudosHonorTitleField({
  label,
  placeholder,
  help,
  value,
  onChange,
}: KudosHonorTitleFieldProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-0.5">
        <span className="text-[22px] leading-7 font-bold text-ink">{label}</span>
        <span className="text-base leading-5 font-bold text-danger">*</span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gold-line bg-white px-6 py-4 text-base leading-6 font-bold tracking-[0.15px] text-ink outline-none placeholder:text-black/40"
      />
      <p className="text-base leading-6 font-bold whitespace-pre-line text-black/50">{help}</p>
    </div>
  );
}
