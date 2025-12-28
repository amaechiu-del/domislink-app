import { Routes, Route, Link } from 'react-router-dom'
import ContentList from './components/ContentList'
import ContentEditor from './components/ContentEditor'

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>DomisLink CMS</h1>
        <nav className="nav">
          <Link to="/">Dashboard</Link>
          <Link to="/content/new">New Content</Link>
        </nav>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<ContentList />} />
          <Route path="/content/new" element={<ContentEditor />} />
          <Route path="/content/:id" element={<ContentEditor />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
