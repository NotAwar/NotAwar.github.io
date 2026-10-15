import { useEffect, useState } from "react";
import { fetchContributions, contributionTotal } from "../lib/github-contributions.js";

const CELL = 11;
const GAP = 3;
const STRIDE = CELL + GAP;
const DAY_LABEL_W = 26;
const MONTH_H = 18;
const LEVEL_COUNT = 5;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export default function ContributionGraph({ githubUrl }) {
  const username = githubUrl?.replace(/\/+$/, "").split("/").pop() || "NotAwar";
  const [grid, setGrid]   = useState([]);
  const [monthMap, setMonthMap] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const json = await fetchContributions(username);
        if (!alive) return;

        const days = json.contributions ?? [];
        const yearTotal = contributionTotal(json);

        // Build week columns
        const built = [];
        const first = new Date(days[0]?.date + "T00:00:00");
        let week = Array(first.getDay()).fill(null); // pad to Sunday

        for (const day of days) {
          week.push(day);
          if (week.length === 7) { built.push(week); week = []; }
        }
        if (week.length) {
          while (week.length < 7) week.push(null);
          built.push(week);
        }

        // Month label positions
        const seen = new Set();
        const labels = [];
        built.forEach((wk, wi) => {
          wk.forEach((d) => {
            if (!d) return;
            const dt = new Date(d.date + "T00:00:00");
            if (dt.getDate() <= 7 && !seen.has(dt.getMonth())) {
              seen.add(dt.getMonth());
              labels.push({ wi, label: MONTHS[dt.getMonth()] });
            }
          });
        });

        setGrid(built);
        setMonthMap(labels);
        setTotal(yearTotal);
        setLoading(false);
      } catch {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [username]);

  if (loading) return <div className="cg-skeleton" />;
  if (!grid.length) return null;

  const graphW = grid.length * STRIDE - GAP;
  const totalW = DAY_LABEL_W + graphW;

  return (
    <div className="cg-wrap">
      <p className="cg-total">
        <strong>
          <span className="count-up" aria-hidden="true" style={{ "--to": total }} />
          <span className="sr-only">{total.toLocaleString("en-GB")}</span>
        </strong>{" "}contributions in the last year
      </p>

      {/* scrollable area */}
      <div className="cg-scroll" role="img" aria-label={`GitHub contribution calendar: ${total.toLocaleString()} contributions in the last year`}>
        <div className="cg-inner" style={{ width: totalW }} aria-hidden="true">

          {/* Month labels row */}
          <div className="cg-months" style={{ marginLeft: DAY_LABEL_W, height: MONTH_H }}>
            {monthMap.map(({ wi, label }) => (
              <span
                key={label}
                className="cg-month"
                style={{ left: wi * STRIDE }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Day labels + week grid */}
          <div className="cg-body">
            <div className="cg-day-labels">
              {DAY_LABELS.map((lbl, i) => (
                <span key={i} className="cg-day-label">{lbl}</span>
              ))}
            </div>

            <div className="cg-weeks">
              {grid.map((week, wi) => (
                <div key={wi} className="cg-week" style={{ "--wi": wi }}>
                  {week.map((day, di) => (
                    <div
                      key={di}
                      style={{ "--di": di }}
                      className={day ? `cg-cell cg-l${Math.min(Math.max(day.level ?? 0, 0), LEVEL_COUNT - 1)}` : "cg-cell cg-empty"}
                      title={day ? `${day.count} contribution${day.count !== 1 ? "s" : ""} on ${day.date}` : undefined}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Legend */}
      <div className="cg-legend" aria-hidden="true">
        <span>Less</span>
        {Array.from({ length: LEVEL_COUNT }, (_, i) => (
          <div key={i} className={`cg-cell cg-l${i}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
