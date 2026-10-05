"use client";

import { useRef, type KeyboardEvent } from "react";
import Link from "next/link";
import { FOCUS_RING_CLASSES } from "@/lib/focus-ring";

export interface SegmentedLink {
  label: string;
  href: string;
  isCurrent: boolean;
}

export interface SegmentedTab {
  id: string;
  label: string;
  panelId: string;
}

interface SegmentedLinksProps {
  label: string;
  links: SegmentedLink[];
}

interface SegmentedTabsProps {
  label: string;
  tabs: SegmentedTab[];
  selectedTabId: string;
  onSelectTab: (tabId: string) => void;
}

type SegmentedControlProps = SegmentedLinksProps | SegmentedTabsProps;

const TRACK_CLASSES =
  "grid auto-cols-fr grid-flow-col gap-0 rounded-full bg-segment-track p-1";

function buildSegmentClasses(isActive: boolean) {
  const stateClasses = isActive
    ? "bg-surface text-ink shadow-tab"
    : "text-muted hover:text-ink";
  return `inline-flex min-h-11 items-center justify-center rounded-full px-4 text-[15px] font-semibold transition-colors duration-200 ${FOCUS_RING_CLASSES} ${stateClasses}`;
}

export function getTabId(tabId: string) {
  return `segmented-tab-${tabId}`;
}

function SegmentedLinks({ label, links }: SegmentedLinksProps) {
  return (
    <nav aria-label={label} className={TRACK_CLASSES}>
      {links.map(({ label: linkLabel, href, isCurrent }) => (
        <Link
          key={href}
          href={href}
          aria-current={isCurrent ? "page" : undefined}
          className={buildSegmentClasses(isCurrent)}
        >
          {linkLabel}
        </Link>
      ))}
    </nav>
  );
}

function SegmentedTabs({
  label,
  tabs,
  selectedTabId,
  onSelectTab,
}: SegmentedTabsProps) {
  const tabElements = useRef<Record<string, HTMLButtonElement | null>>({});

  function moveSelectionTo(tabIndex: number) {
    const nextTab = tabs[(tabIndex + tabs.length) % tabs.length];
    onSelectTab(nextTab.id);
    tabElements.current[nextTab.id]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent, tabIndex: number) {
    const targetIndexByKey: Record<string, number> = {
      ArrowRight: tabIndex + 1,
      ArrowLeft: tabIndex - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    const targetIndex = targetIndexByKey[event.key];
    if (targetIndex === undefined) return;

    event.preventDefault();
    moveSelectionTo(targetIndex);
  }

  return (
    <div role="tablist" aria-label={label} className={TRACK_CLASSES}>
      {tabs.map(({ id, label: tabLabel, panelId }, tabIndex) => {
        const isSelected = id === selectedTabId;
        return (
          <button
            key={id}
            ref={(element) => {
              tabElements.current[id] = element;
            }}
            type="button"
            role="tab"
            id={getTabId(id)}
            aria-selected={isSelected}
            aria-controls={panelId}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelectTab(id)}
            onKeyDown={(event) => handleKeyDown(event, tabIndex)}
            className={buildSegmentClasses(isSelected)}
          >
            {tabLabel}
          </button>
        );
      })}
    </div>
  );
}

export default function SegmentedControl(props: SegmentedControlProps) {
  return "tabs" in props ? (
    <SegmentedTabs {...props} />
  ) : (
    <SegmentedLinks {...props} />
  );
}
