/**
 * Card — the standard elevated-surface container. Implements the hover
 * lift micro-interaction spec (lift 4px + deeper shadow) when `hoverable`
 * is set, used for clickable cards (ProgrammeCard, CohortCard).
 */

export function Card({ children, hoverable = false, className = '', ...rest }) {
  return (
    <div
      className={`
        rounded-md border border-border bg-surface-elevated p-5 shadow-card
        transition-all duration-200
        ${hoverable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-elevated' : ''}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;