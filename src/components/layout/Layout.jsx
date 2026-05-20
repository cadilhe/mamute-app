import { Sidebar } from './Sidebar';
export function Layout({ children }) {
  return (
    <div style={{ display:'flex' }}>
      <Sidebar />
      <main style={{ marginLeft:'var(--sidebar-w)', flex:1, minHeight:'100vh', padding:32 }}>
        {children}
      </main>
    </div>
  );
}
