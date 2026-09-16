import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from './App'
import { installDevAuth } from './admin/devAuth'

// No-op outside dev mode. Installed here rather than in a component because
// it has to be in place before the first render issues a request.
installDevAuth()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
