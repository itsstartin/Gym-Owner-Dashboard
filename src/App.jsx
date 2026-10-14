import './App.css'
import MainPage from './pages/MainPage'
import {BrowserRouter as Router} from 'react-router'
import { RoleProvider } from './features/roleAccess'

function App() {

  return (
    // <div className='
    // flex
    // justify-between
    // '
    // >
    //   <WelcomeHeader/>
    //   <IconDescBtn/>
    //   <StatsCard/>
    // </div>
    <Router>
      <RoleProvider>
        <MainPage/>
      </RoleProvider>
    </Router>
  )
}

export default App
