import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './AppNew.jsx'
import { store } from './store/store'
import AgentDashboard from './pages/agent/AgentDashboard.jsx'
import TicketDetailPage from './pages/customer/TicketDetailPage.jsx'
import MyTicketsPage from './pages/customer/MyTicketsPage.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/agent" element={<AgentDashboard />} />
          <Route path="/my-tickets" element={<MyTicketsPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
