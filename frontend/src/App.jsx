import { useLinks } from './hooks/useLinks';
import { LinkForm } from './components/LinkForm';
import { LinkList } from './components/LinkList';

function App() {
  const { links, loading, error, addLink, removeLink, trackClick } = useLinks();

  return (
    <div className="container">
      <header>
        <h1>DomisLink</h1>
        <p>Manage and track your links</p>
      </header>

      <main>
        <LinkForm onSubmit={addLink} />
        <LinkList
          links={links}
          loading={loading}
          error={error}
          onDelete={removeLink}
          onTrackClick={trackClick}
        />
      </main>
    </div>
  );
}

export default App;
