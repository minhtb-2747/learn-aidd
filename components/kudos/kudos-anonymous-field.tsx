"use client";

export interface KudosAnonymousFieldProps {
  anonymousLabel: string;
  nicknameLabel: string;
  nicknamePlaceholder: string;
  anonymous: boolean;
  onAnonymousChange: (value: boolean) => void;
  nickname: string;
  onNicknameChange: (value: string) => void;
}

/**
 * Anonymous-mode block of the Write/Edit-Kudos dialog: the "Gửi ẩn danh"
 * checkbox plus its dependent, required "Nickname ẩn danh" field, shown only
 * while the checkbox is checked (per the edit-dialog design, MoMorph node
 * `1949:13746`). Applies to both create and edit — it's the anonymous-mode
 * field, not edit-only. Split out of `write-kudos-dialog.tsx` to keep that
 * file under the 200-line guideline.
 */
export default function KudosAnonymousField({
  anonymousLabel,
  nicknameLabel,
  nicknamePlaceholder,
  anonymous,
  onAnonymousChange,
  nickname,
  onNicknameChange,
}: KudosAnonymousFieldProps) {
  return (
    <div className="flex w-full flex-col gap-4">
      <label className="flex w-full items-center gap-4">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(event) => onAnonymousChange(event.target.checked)}
          className="h-6 w-6 shrink-0 rounded border-black/20 accent-ink"
        />
        <span className="text-[22px] leading-7 font-bold text-black/50">{anonymousLabel}</span>
      </label>

      {anonymous && (
        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center gap-0.5">
            <span className="text-[22px] leading-7 font-bold text-ink">{nicknameLabel}</span>
            <span className="text-base leading-5 font-bold text-danger">*</span>
          </div>
          <input
            type="text"
            value={nickname}
            onChange={(event) => onNicknameChange(event.target.value)}
            placeholder={nicknamePlaceholder}
            className="w-full rounded-lg border border-gold-line bg-white px-6 py-4 text-base leading-6 font-bold tracking-[0.15px] text-ink outline-none placeholder:text-black/40"
          />
        </div>
      )}
    </div>
  );
}
