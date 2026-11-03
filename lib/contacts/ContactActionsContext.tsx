"use client";
import { createContext, useContext, type ReactNode } from "react";
import {
  addContact,
  addTalkEvent,
  deleteContact,
  deleteTalkEvent,
  getTalkEvents,
  markAsTalked,
  updateContact,
} from "@/lib/actions/contacts";
import { unlinkContact } from "@/lib/actions/links";

/**
 * The contact writes and reads the home page components call. The real app
 * uses the Server Actions (the default, no provider needed); `/demo` provides
 * localStorage versions with the same signatures. A new action used by these
 * components must be added here and to `lib/demo/demoStore.ts`.
 */
export type ContactActions = {
  addContact: typeof addContact;
  updateContact: typeof updateContact;
  deleteContact: typeof deleteContact;
  markAsTalked: typeof markAsTalked;
  addTalkEvent: typeof addTalkEvent;
  deleteTalkEvent: typeof deleteTalkEvent;
  getTalkEvents: typeof getTalkEvents;
  unlinkContact: typeof unlinkContact;
  /** True on `/demo`: features that need a real account are replaced. */
  isDemo: boolean;
};

const serverContactActions: ContactActions = {
  addContact,
  updateContact,
  deleteContact,
  markAsTalked,
  addTalkEvent,
  deleteTalkEvent,
  getTalkEvents,
  unlinkContact,
  isDemo: false,
};

const ContactActionsContext =
  createContext<ContactActions>(serverContactActions);

export function ContactActionsProvider({
  value,
  children,
}: {
  value: ContactActions;
  children: ReactNode;
}) {
  return (
    <ContactActionsContext.Provider value={value}>
      {children}
    </ContactActionsContext.Provider>
  );
}

export function useContactActions(): ContactActions {
  return useContext(ContactActionsContext);
}
