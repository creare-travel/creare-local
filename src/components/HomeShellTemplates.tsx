import Header from '@/components/Header';

// Inert snapshots reuse the actual header design, labels and navigation routes.
export default function HomeShellTemplates() {
  return (
    <>
      {(['hero', 'light'] as const).flatMap((state) =>
        [false, true].map((mobileOpen) => (
          <template
            key={`${state}-${mobileOpen}`}
            id={`home-header-${state}-${mobileOpen ? 'open' : 'closed'}`}
          >
            <Header snapshot={{ state, mobileOpen }} />
          </template>
        ))
      )}
    </>
  );
}
