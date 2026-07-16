import { ReactNode } from "react";

export type StatCardOption = {
  id: string;
  title: string;
  value: number | string;
  description: string;
  icon: ReactNode;
  trendIcon: ReactNode;
  variant: "total" | "active" | "inactive";
  trend: "neutral" | "positive" | "negative";
  ariaLabel: string;
};

interface StatCardsProps {
  ariaLabel: string;
  cards: StatCardOption[];
  className?: string;
}

function StatCards({ ariaLabel, cards, className = "" }: StatCardsProps) {
  return (
    <section
      className={`dashboard-analytics ${className}`.trim()}
      aria-label={ariaLabel}
    >
      {/* UU: Statistikkortene er fokuserbare slik at tastatur og skjermleser får lest opp tallene. */}
      {/* Kortene styres av options, saa samme komponent kan brukes for brukere, team osv. */}
      {cards.map((card) => (
        <div
          key={card.id}
          className={`analytics-card stat-${card.variant}`}
          role="group"
          tabIndex={0}
          aria-label={card.ariaLabel}
        >
          <div className={`icon-box stat-icon-${card.variant}`}>
            {card.icon}
          </div>

          <ul className="analytics-list">
            <li>{card.title}</li>
            <li>
              <h3>{card.value}</h3>
            </li>
            <li className={`analytics-change change-${card.trend}`}>
              {card.trendIcon}
              {card.value}
              <p>{card.description}</p>
            </li>
          </ul>
        </div>
      ))}
    </section>
  );
}

export default StatCards;
