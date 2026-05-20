export function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick}
      style={{ background:'var(--surface)', borderRadius:'var(--radius)', border:'1px solid var(--border)', padding:20, boxShadow:'var(--shadow)', cursor:onClick?'pointer':'default', transition:'box-shadow 0.15s', ...style }}
      onMouseEnter={onClick?(e)=>e.currentTarget.style.boxShadow='var(--shadow-md)':undefined}
      onMouseLeave={onClick?(e)=>e.currentTarget.style.boxShadow='var(--shadow)':undefined}
    >{children}</div>
  );
}
