"use client";

import {
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import type { FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/i18n/config";
import { createApiToken, revokeApiToken } from "@/lib/actions/apiTokens";
import type { ApiTokenListItem } from "@/lib/db/queries/apiTokens";
import { maxApiTokensPerUser, maxNameLength } from "@/lib/ConstantsFile";
import { P, P1, P2 } from "@/Components/ui/Text";
import Button from "@/Components/ui/Button";
import CharactersLeft from "@/Components/ui/CharactersLeft";
import Dialog from "@/Components/ui/Dialog";
import ErrorWarning from "@/Components/ui/ErrorWarning";
import {
  basicInputClasses,
  basicLabelClasses,
  inputSubmitClasses,
} from "@/Components/ui/formClasses";

// Same mapping as TalkEvents, so dates read the same across the app.
const DATE_LOCALES: Record<Locale, string> = { en: "en-GB", de: "de-DE" };

const COPIED_FEEDBACK_MS = 2000;

const subscribeNever = () => () => {};

/**
 * False during the server render and hydration, true after. Dates are shown
 * only then: the server formats in UTC, the browser in the user's zone, and a
 * date near midnight would differ and break hydration.
 */
function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

function formatDate(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(DATE_LOCALES[locale], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * MCP access tokens for AI agents: create, copy once, revoke. The list comes
 * from props. A create or revoke makes the server revalidate /settings, which
 * re-renders this component with a fresh list, so the list is never copied
 * into state.
 */
export default function ApiTokens({
  initialTokens,
  mcpUrl,
}: {
  initialTokens: ApiTokenListItem[];
  mcpUrl: string;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const isClient = useIsClient();
  const titleId = useId();
  const [name, setName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, startCreating] = useTransition();
  // The full token exists only here, right after a create. It is never stored.
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [tokenToRevoke, setTokenToRevoke] = useState<ApiTokenListItem | null>(
    null,
  );
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [isRevoking, startRevoking] = useTransition();

  const isAtLimit = initialTokens.length >= maxApiTokensPerUser;
  // Built here, not in the JSON: ICU would read the braces of ${...} as a parameter.
  const connectCommand = `claude mcp add --transport http stay-in-touch ${mcpUrl} --header "Authorization: Bearer \${STAY_IN_TOUCH_TOKEN}"`;

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);
    // A transition keeps isCreating true until the revalidated list is
    // rendered, the same as AddNewContact.
    startCreating(async () => {
      try {
        const result = await createApiToken(name);
        if (result.ok) {
          setName("");
          setCopied(false);
          setCopyError(null);
          setNewToken(result.token);
        } else {
          setCreateError(result.error);
        }
      } catch (caughtError) {
        console.error("Could not create the access token:", caughtError);
        setCreateError(t("apiTokens.saveFailed"));
      }
    });
  }

  async function handleCopy(token: string) {
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
    } catch (caughtError) {
      console.error("Could not copy the access token:", caughtError);
      setCopyError(t("apiTokens.copyFailed"));
    }
  }

  function closeNewToken() {
    setNewToken(null);
    setCopied(false);
    setCopyError(null);
  }

  function openRevoke(token: ApiTokenListItem) {
    setRevokeError(null);
    setTokenToRevoke(token);
  }

  function closeRevoke() {
    if (!isRevoking) {
      setTokenToRevoke(null);
      setRevokeError(null);
    }
  }

  function confirmRevoke(token: ApiTokenListItem) {
    setRevokeError(null);
    startRevoking(async () => {
      try {
        const result = await revokeApiToken(token.id);
        if (result.ok) {
          setTokenToRevoke(null);
        } else {
          setRevokeError(result.error);
        }
      } catch (caughtError) {
        console.error("Could not revoke the access token:", caughtError);
        setRevokeError(t("apiTokens.saveFailed"));
      }
    });
  }

  return (
    <section
      id="access-tokens"
      aria-labelledby={titleId}
      className="w-full scroll-mt-4 rounded-[10px] border border-black/10 bg-white p-4 sm:p-6"
    >
      <div className="flex flex-col gap-4">
        <div>
          <div id={titleId}>
            <P extraClasses="text-lg font-semibold mb-2">
              {t("apiTokens.title")}
            </P>
          </div>
          <P2 extraClasses="text-grey3">{t("apiTokens.intro")}</P2>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-2">
          <label className={basicLabelClasses}>
            {t("apiTokens.nameLabel")}
            <div className="relative flex flex-col">
              <input
                type="text"
                name="name"
                value={name}
                required
                maxLength={maxNameLength}
                placeholder={t("apiTokens.namePlaceholder")}
                disabled={isCreating || isAtLimit}
                onChange={(event) => {
                  setName(event.target.value);
                  setCreateError(null);
                }}
                className={twMerge(
                  basicInputClasses,
                  "border-grey2 border border-solid pr-14",
                )}
              />
              <CharactersLeft length={name.length} max={maxNameLength} />
            </div>
          </label>
          <button
            type="submit"
            disabled={isCreating || isAtLimit || name === ""}
            aria-busy={isCreating}
            className={twMerge(
              inputSubmitClasses,
              "bg-blue1 hover:bg-blue3 h-10 self-start px-3",
            )}
          >
            {isCreating ? t("apiTokens.creating") : t("apiTokens.create")}
          </button>
          {createError && <ErrorWarning errorMessage={createError} />}
          {isAtLimit && (
            <P2 extraClasses="text-grey3">
              {t("apiTokens.limitReached", { limit: maxApiTokensPerUser })}
            </P2>
          )}
        </form>

        {newToken && (
          <div className="border-green2 bg-grey1 flex flex-col gap-3 rounded border border-solid p-3">
            <P1 extraClasses="font-semibold">{t("apiTokens.newTokenTitle")}</P1>
            <P2 extraClasses="font-semibold">
              {t("apiTokens.newTokenWarning")}
            </P2>
            <input
              type="text"
              readOnly
              value={newToken}
              aria-label={t("apiTokens.newTokenTitle")}
              onFocus={(event) => event.currentTarget.select()}
              className={twMerge(basicInputClasses, "w-full font-mono text-xs")}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                buttonText={
                  copied ? t("apiTokens.copied") : t("apiTokens.copy")
                }
                onClick={() => handleCopy(newToken)}
              />
              <Button
                buttonText={t("apiTokens.done")}
                onClick={closeNewToken}
                variant="Secondary"
              />
              <span className="sr-only" aria-live="polite">
                {copied ? t("apiTokens.copied") : ""}
              </span>
            </div>
            {copyError && <ErrorWarning errorMessage={copyError} />}
            <P2>{t("apiTokens.connectIntro")}</P2>
            <P2>{t("apiTokens.connectEnvHint")}</P2>
            <pre className="overflow-x-auto rounded bg-white p-2 font-mono text-xs">
              <code>{connectCommand}</code>
            </pre>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <P1 extraClasses="font-semibold">{t("apiTokens.listTitle")}</P1>
          {initialTokens.length === 0 ? (
            <P2 extraClasses="text-grey3">{t("apiTokens.empty")}</P2>
          ) : (
            <ul className="m-0 flex flex-col gap-2 p-0">
              {initialTokens.map((token) => (
                <li
                  key={token.id}
                  className="border-green2 bg-grey1 flex list-none flex-col gap-2 rounded border border-solid p-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <P2 extraClasses="font-semibold break-all">{token.name}</P2>
                    <P2 extraClasses="font-mono text-xs">
                      {token.tokenPrefix}…
                    </P2>
                    {isClient && (
                      <>
                        <P2 extraClasses="text-grey3 text-xs">
                          {t("apiTokens.created", {
                            date: formatDate(token.createdAt, locale),
                          })}
                        </P2>
                        <P2 extraClasses="text-grey3 text-xs">
                          {token.lastUsedAt
                            ? t("apiTokens.lastUsed", {
                                date: formatDate(token.lastUsedAt, locale),
                              })
                            : t("apiTokens.neverUsed")}
                        </P2>
                      </>
                    )}
                  </div>
                  <Button
                    buttonText={t("apiTokens.revoke")}
                    onClick={() => openRevoke(token)}
                    variant="Danger"
                    ariaLabel={t("apiTokens.revokeTitle", { name: token.name })}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <P2 extraClasses="text-grey3">{t("apiTokens.logoutNote")}</P2>
      </div>

      <Dialog
        title={t("apiTokens.revokeTitle", { name: tokenToRevoke?.name ?? "" })}
        isOpen={tokenToRevoke !== null}
        close={closeRevoke}
      >
        {tokenToRevoke && (
          <div className="flex flex-col gap-4">
            <P2>{t("apiTokens.revokeBody")}</P2>
            {revokeError && <ErrorWarning errorMessage={revokeError} />}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                buttonText={t("common.cancel")}
                onClick={closeRevoke}
                variant="Secondary"
                disabled={isRevoking}
              />
              <Button
                buttonText={
                  isRevoking
                    ? t("apiTokens.revoking")
                    : t("apiTokens.revokeConfirm")
                }
                onClick={() => confirmRevoke(tokenToRevoke)}
                variant="Danger"
                disabled={isRevoking}
              />
            </div>
          </div>
        )}
      </Dialog>
    </section>
  );
}
