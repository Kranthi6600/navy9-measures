"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { searchOrdersAndCustomers } from "@/app/actions";
import type { SearchResult } from "@/lib/types";

export function CustomerSearch() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<{ query: string; data: SearchResult } | null>(null);
  const query = q.trim();

  useEffect(() => {
    if (query.length < 2) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const data = await searchOrdersAndCustomers(query);
      if (!cancelled) setResult({ query, data });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const data = query.length >= 2 && result?.query === query ? result.data : null;
  const empty = data && !data.customers.length && !data.orders.length;

  return (
    <div className="relative">
      <label className="label" htmlFor="search">Order No. / customer search</label>
      <input
        id="search"
        className="input"
        type="search"
        autoComplete="off"
        placeholder="Search by order no., name or mobile to load an existing customer"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
          if (e.key === "Escape") setQ("");
        }}
      />
      {data && (
        <ul className="absolute z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-slate-200 bg-white text-sm shadow-lg">
          {data.customers.map((c) => (
            <li key={c.id}>
              <Link href={`/orders/new?customer=${c.id}`} className="block px-3 py-2 hover:bg-slate-50" onClick={() => setQ("")}>
                <span className="font-medium">{c.name}</span>
                <span className="ml-2 text-slate-500">{c.mobile}</span>
                <span className="float-right text-xs text-blue-900">New order</span>
              </Link>
            </li>
          ))}
          {data.orders.map((o) => (
            <li key={o.id}>
              <Link href={`/orders/${o.id}/edit`} className="block px-3 py-2 hover:bg-slate-50">
                <span className="font-mono font-medium">#{o.orderNumber}</span>
                <span className="ml-2 text-slate-500">{o.customerName}</span>
                <span className="float-right text-xs text-blue-900">Open order</span>
              </Link>
            </li>
          ))}
          {empty && <li className="px-3 py-2 text-slate-500">No matches. Fill in the details below for a new customer.</li>}
        </ul>
      )}
    </div>
  );
}
