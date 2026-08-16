"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const readArray = (key: string) => {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.filter((item) => Number.isInteger(item)) : [];
  } catch {
    return [];
  }
};

export function AdminTableExperience() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-admin-workspace]");
    if (!root) return;
    const cleanups: Array<() => void> = [];
    let scheduled = false;

    const sync = () => {
      scheduled = false;
      const tables = Array.from(
        root.querySelectorAll<HTMLTableElement>("table:not([data-smart-table])"),
      );
      tables.forEach((table, tableIndex) => {
        const headers = Array.from(table.querySelectorAll<HTMLTableCellElement>("thead th"));
        if (!headers.length) return;
        const preferenceKey = `admin-table:${pathname}:${tableIndex}`;
        const hiddenKey = `${preferenceKey}:hidden`;
        const densityKey = `${preferenceKey}:compact`;
        const hiddenColumns = readArray(hiddenKey);
        const compact = window.localStorage.getItem(densityKey) === "true";
        table.dataset.adminTable = "enhanced";
        table.dataset.density = compact ? "compact" : "comfortable";

        const applyColumns = () => {
          const hidden = readArray(hiddenKey);
          headers.forEach((header, index) => { header.hidden = hidden.includes(index); });
          Array.from(table.tBodies).forEach((body) =>
            Array.from(body.rows).forEach((row) =>
              Array.from(row.cells).forEach((cell, index) => {
                cell.hidden = hidden.includes(index);
                cell.dataset.label = headers[index]?.textContent?.trim() ?? "";
              }),
            ),
          );
        };
        applyColumns();

        if (!table.dataset.sortBound) {
          table.dataset.sortBound = "true";
          headers.forEach((header, columnIndex) => {
            const label = header.textContent?.trim() ?? "";
            if (!label || label.includes("الإجراءات")) return;
            header.classList.add("admin-sortable-heading");
            header.tabIndex = 0;
            const sortRows = () => {
              const body = table.tBodies[0];
              if (!body || body.rows.length < 2) return;
              const nextDirection = header.dataset.sortDirection === "asc" ? "desc" : "asc";
              headers.forEach((item) => delete item.dataset.sortDirection);
              header.dataset.sortDirection = nextDirection;
              const rows = Array.from(body.rows);
              rows.sort((left, right) => {
                const a = left.cells[columnIndex]?.textContent?.trim() ?? "";
                const b = right.cells[columnIndex]?.textContent?.trim() ?? "";
                const result = a.localeCompare(b, "ar", { numeric: true, sensitivity: "base" });
                return nextDirection === "asc" ? result : -result;
              });
              rows.forEach((row) => body.appendChild(row));
            };
            const onClick = () => sortRows();
            const onKeyDown = (event: KeyboardEvent) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                sortRows();
              }
            };
            header.addEventListener("click", onClick);
            header.addEventListener("keydown", onKeyDown);
            cleanups.push(() => {
              header.removeEventListener("click", onClick);
              header.removeEventListener("keydown", onKeyDown);
            });
          });
        }

        const host = table.parentElement;
        if (!host) return;
        const existingToolbar = host.querySelector<HTMLElement>(
          ":scope > [data-admin-table-tools]",
        );
        if (existingToolbar) {
          const existingCount = existingToolbar.querySelector<HTMLElement>(
            ".admin-table-result-count",
          );
          if (existingCount)
            existingCount.textContent = `${table.tBodies[0]?.rows.length ?? 0} صف`;
          return;
        }
        const toolbar = document.createElement("div");
        toolbar.dataset.adminTableTools = "true";
        toolbar.className = "admin-table-tools";

        const count = document.createElement("span");
        count.className = "admin-table-result-count";
        count.textContent = `${table.tBodies[0]?.rows.length ?? 0} صف`;
        toolbar.appendChild(count);

        const controls = document.createElement("div");
        controls.className = "admin-table-controls";
        const densityButton = document.createElement("button");
        densityButton.type = "button";
        densityButton.className = "admin-table-tool-button";
        densityButton.textContent = compact ? "عرض مريح" : "عرض مضغوط";
        densityButton.addEventListener("click", () => {
          const nextCompact = table.dataset.density !== "compact";
          table.dataset.density = nextCompact ? "compact" : "comfortable";
          window.localStorage.setItem(densityKey, String(nextCompact));
          densityButton.textContent = nextCompact ? "عرض مريح" : "عرض مضغوط";
        });
        controls.appendChild(densityButton);

        if (headers.length > 2) {
          const details = document.createElement("details");
          details.className = "admin-column-picker";
          const summary = document.createElement("summary");
          summary.className = "admin-table-tool-button";
          summary.textContent = "الأعمدة";
          details.appendChild(summary);
          const menu = document.createElement("div");
          menu.className = "admin-column-picker-menu";
          headers.forEach((header, columnIndex) => {
            const labelText = header.textContent?.trim() || `عمود ${columnIndex + 1}`;
            if (labelText.includes("الإجراءات")) return;
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = !hiddenColumns.includes(columnIndex);
            checkbox.addEventListener("change", () => {
              const current = readArray(hiddenKey);
              const next = checkbox.checked
                ? current.filter((item) => item !== columnIndex)
                : [...new Set([...current, columnIndex])];
              window.localStorage.setItem(hiddenKey, JSON.stringify(next));
              applyColumns();
            });
            label.append(checkbox, document.createTextNode(labelText));
            menu.appendChild(label);
          });
          details.appendChild(menu);
          controls.appendChild(details);
        }
        toolbar.appendChild(controls);
        host.insertBefore(toolbar, table);
        cleanups.push(() => toolbar.remove());
      });
    };

    const scheduleSync = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(sync);
    };
    sync();
    const observer = new MutationObserver(scheduleSync);
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [pathname]);

  return null;
}
