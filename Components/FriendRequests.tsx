"use client";
import { useState, useEffect } from "react";
import { rejectLinkRequest, cancelLinkRequest } from "@/lib/actions/links";
import type {
  IncomingLinkRequest,
  OutgoingLinkRequest,
  LinkableContact,
} from "@/lib/db/queries/links";
import { P, P2 } from "./ui/Text";
import Button from "./ui/Button";
import AcceptLinkDialog from "./AcceptLinkDialog";
import ErrorWarning from "./ErrorWarning";

export default function FriendRequests({
  incoming,
  outgoing,
  linkableContacts,
}: {
  incoming: IncomingLinkRequest[];
  outgoing: OutgoingLinkRequest[];
  linkableContacts: LinkableContact[];
}) {
  const [selectedRequest, setSelectedRequest] = useState<
    IncomingLinkRequest | null
  >(null);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [error, setError] = useState<string | false>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      const timeoutId = setTimeout(() => {
        setError(false);
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [error]);

  function openAcceptDialog(request: IncomingLinkRequest) {
    setSelectedRequest(request);
    setIsAcceptDialogOpen(true);
  }

  async function handleRejectRequest(requestId: string) {
    setProcessingId(requestId);
    const result = await rejectLinkRequest(requestId);
    setProcessingId(null);
    if (!result.ok) {
      setError(result.error);
    }
  }

  async function handleCancelRequest(requestId: string) {
    setProcessingId(requestId);
    const result = await cancelLinkRequest(requestId);
    setProcessingId(null);
    if (!result.ok) {
      setError(result.error);
    }
  }

  return (
    <section className="bg-white rounded-[10px] border border-black/10 p-6 w-full">
      <div className="mb-6">
        <P extraClasses="text-lg font-semibold mb-2">Friend requests</P>
        <P2 extraClasses="text-grey3">
          Linked contacts share talks: when either of you marks that you talked,
          both timers reset. Notes and settings stay private.
        </P2>
      </div>

      {/* Incoming requests */}
      <div className="mb-8">
        <P extraClasses="font-medium text-base mb-3">Incoming</P>
        {incoming.length === 0 ? (
          <P2 extraClasses="text-grey3">No incoming requests.</P2>
        ) : (
          <div className="space-y-3">
            {incoming.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 bg-grey1 rounded-lg"
              >
                <div className="flex-1">
                  <P extraClasses="font-medium">{request.fromName}</P>
                  <P2 extraClasses="text-grey3">{request.fromEmail}</P2>
                  <P2 extraClasses="text-grey3 text-xs mt-1">
                    wants to link with you
                  </P2>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    buttonText="Accept"
                    onClick={() => openAcceptDialog(request)}
                    disabled={processingId === request.id}
                  />
                  <Button
                    buttonText="Reject"
                    onClick={() => handleRejectRequest(request.id)}
                    variant="Secondary"
                    disabled={processingId === request.id}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing requests */}
      <div>
        <P extraClasses="font-medium text-base mb-3">Outgoing</P>
        {outgoing.length === 0 ? (
          <P2 extraClasses="text-grey3">No pending requests sent.</P2>
        ) : (
          <div className="space-y-3">
            {outgoing.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 bg-grey1 rounded-lg"
              >
                <div className="flex-1">
                  <P extraClasses="text-sm">
                    <span className="font-medium">Your contact</span>
                    {` "${request.contactName}"`}
                    {` → ${request.toEmail}`}
                    <span className="text-grey3"> · waiting</span>
                  </P>
                </div>
                <Button
                  buttonText="Cancel"
                  onClick={() => handleCancelRequest(request.id)}
                  variant="Secondary"
                  disabled={processingId === request.id}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <ErrorWarning errorMessage={error} />}

      {selectedRequest && (
        <AcceptLinkDialog
          request={selectedRequest}
          linkableContacts={linkableContacts}
          isOpen={isAcceptDialogOpen}
          close={() => {
            setIsAcceptDialogOpen(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </section>
  );
}
